import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

import {
  CommercialFulfillmentError,
  CommercialFulfillmentService,
} from "@/lib/services/commercial-fulfillment.service";
import { PurchaseService } from "@/lib/services/purchase.service";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { STRIPE_CHECKOUT_ERROR_CODES } from "@/lib/stripe/stripe-errors";
import type { Purchase } from "@/lib/types/commercial.types";

export type StripeWebhookProcessingResult = {
  stripeEventId: string;
  status:
    | "processed"
    | "ignored"
    | "duplicate"
    | "permanent_failure"
    | "retryable_failure";
  purchaseId: string | null;
};

const supportedStripeWebhookEvents = new Set<string>([
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
  "charge.dispute.created",
  "charge.dispute.closed",
]);

class StripeWebhookProcessingError extends Error {
  readonly code: string;
  readonly purchaseId: string | null;

  constructor(
    code: string,
    message: string,
    options: {
      purchaseId?: string | null;
    } = {},
  ) {
    super(message);
    this.name = "StripeWebhookProcessingError";
    this.code = code;
    this.purchaseId = options.purchaseId ?? null;
  }
}

const permanentWebhookErrorCodes = new Set<string>([
  "PURCHASE_NOT_FOUND",
  "PURCHASE_NOT_PAID",
  "ENROLLMENT_LINK_CONFLICT",
  "ENROLLMENT_REVOKED_CONFLICT",
  "ENROLLMENT_EXPIRED_CONFLICT",
  "ENROLLMENT_NOT_YET_ACTIVE_CONFLICT",
  STRIPE_CHECKOUT_ERROR_CODES.PURCHASE_METADATA_MISMATCH,
  STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_INTENT_MISMATCH,
  STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_AMOUNT_MISMATCH,
  STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_CURRENCY_MISMATCH,
  STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_REFERENCE_MISMATCH,
  STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_PRODUCT_MISMATCH,
  STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_PROFILE_MISMATCH,
  STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_AMOUNT_MISMATCH,
  STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_CURRENCY_MISMATCH,
  STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_METADATA_MISMATCH,
  STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_STATUS_INVALID,
  STRIPE_CHECKOUT_ERROR_CODES.PURCHASE_STATE_TRANSITION_INVALID,
  STRIPE_CHECKOUT_ERROR_CODES.PURCHASE_AMOUNT_INVALID,
]);

function isStaleProcessingEvent(event: Purchase["createdAt"] | string) {
  const processingAgeMs = Date.now() - new Date(event).getTime();

  return processingAgeMs > 10 * 60 * 1000;
}

function getObjectId(
  value: string | { id?: string } | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.id ?? null;
}

function getMetadataValue(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getSafeErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 300);
  }

  return "Webhook processing failed.";
}

function normalizeCurrency(currency: string | null | undefined) {
  return currency ? currency.toUpperCase() : null;
}

function assertAmountMatchesPurchase(
  input: {
    actualAmount: number | null | undefined;
    actualCurrency: string | null | undefined;
    purchase: Purchase;
    amountErrorCode: string;
    currencyErrorCode: string;
  },
) {
  if (
    input.actualAmount !== null &&
    input.actualAmount !== undefined &&
    input.purchase.amountTotalMinor !== null &&
    input.actualAmount !== input.purchase.amountTotalMinor
  ) {
    throw new StripeWebhookProcessingError(
      input.amountErrorCode,
      "Stripe amount does not match the internal purchase amount.",
      {
        purchaseId: input.purchase.id,
      },
    );
  }

  const actualCurrency = normalizeCurrency(input.actualCurrency);

  if (actualCurrency && actualCurrency !== input.purchase.currency) {
    throw new StripeWebhookProcessingError(
      input.currencyErrorCode,
      "Stripe currency does not match the internal purchase currency.",
      {
        purchaseId: input.purchase.id,
      },
    );
  }
}

async function syncProviderAmountWithPurchase(
  input: {
    actualAmount: number | null | undefined;
    actualCurrency: string | null | undefined;
    purchase: Purchase;
  },
  supabase: SupabaseClient<Database>,
) {
  if (input.actualAmount === null || input.actualAmount === undefined) {
    return input.purchase;
  }

  const actualCurrency = normalizeCurrency(input.actualCurrency);

  if (!actualCurrency) {
    return input.purchase;
  }

  return PurchaseService.recordProviderAmount(
    {
      purchaseId: input.purchase.id,
      amountTotalMinor: input.actualAmount,
      currency: actualCurrency,
    },
    supabase,
  );
}

function buildPayloadSummary(event: Stripe.Event) {
  const eventObject = event.data.object as {
    id?: string;
    object?: string;
    payment_intent?: string | { id?: string } | null;
    metadata?: Stripe.Metadata | null;
  };

  return {
    object_id: eventObject.id ?? null,
    object_type: eventObject.object ?? null,
    payment_intent_id: getObjectId(eventObject.payment_intent),
    purchase_id: getMetadataValue(eventObject.metadata, "purchase_id"),
  };
}

async function failWithoutPurchase(
  stripeEventId: string,
  errorMessage: string,
  supabase: SupabaseClient<Database>,
) {
  await PurchaseService.markWebhookFailed(
    stripeEventId,
    {
      lastErrorCode: "PURCHASE_NOT_FOUND",
      errorMessage,
    },
    supabase,
  );

  return {
    stripeEventId,
    status: "permanent_failure",
    purchaseId: null,
  } satisfies StripeWebhookProcessingResult;
}

function assertMetadataMatchesPurchase(
  purchase: Purchase,
  metadata: Stripe.Metadata | null | undefined,
  codes: {
    purchase: string;
    profile: string;
    product: string;
  },
) {
  const metadataPurchaseId = getMetadataValue(metadata, "purchase_id");
  const metadataProfileId = getMetadataValue(metadata, "profile_id");
  const metadataProductId = getMetadataValue(metadata, "internal_product_id");

  if (metadataPurchaseId && metadataPurchaseId !== purchase.id) {
    throw new StripeWebhookProcessingError(
      codes.purchase,
      "Stripe metadata purchase_id does not match the resolved purchase.",
      {
        purchaseId: purchase.id,
      },
    );
  }

  if (metadataProfileId && metadataProfileId !== purchase.profileId) {
    throw new StripeWebhookProcessingError(
      codes.profile,
      "Stripe metadata profile_id does not match the resolved purchase.",
      {
        purchaseId: purchase.id,
      },
    );
  }

  if (metadataProductId && metadataProductId !== purchase.productId) {
    throw new StripeWebhookProcessingError(
      codes.product,
      "Stripe metadata internal_product_id does not match the resolved purchase.",
      {
        purchaseId: purchase.id,
      },
    );
  }
}

async function getPurchaseByMetadata(
  metadata: Stripe.Metadata | null | undefined,
  supabase: SupabaseClient<Database>,
) {
  const metadataPurchaseId = getMetadataValue(metadata, "purchase_id");

  if (!metadataPurchaseId) {
    return null;
  }

  return PurchaseService.getById(metadataPurchaseId, supabase);
}

async function processCheckoutSessionCompleted(
  event: Stripe.Event,
  supabase: SupabaseClient<Database>,
): Promise<Purchase | null> {
  const session = event.data.object as Stripe.Checkout.Session;
  const purchaseBySession = await PurchaseService.getByProviderCheckoutSessionId(
    session.id,
    supabase,
  );
  const purchaseByMetadata = purchaseBySession
    ? null
    : await getPurchaseByMetadata(session.metadata, supabase);
  const purchase = purchaseBySession ?? purchaseByMetadata;

  if (!purchase) {
    return null;
  }

  assertMetadataMatchesPurchase(purchase, session.metadata, {
    purchase: STRIPE_CHECKOUT_ERROR_CODES.PURCHASE_METADATA_MISMATCH,
    profile: STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_PROFILE_MISMATCH,
    product: STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_PRODUCT_MISMATCH,
  });

  if (
    session.client_reference_id &&
    session.client_reference_id !== purchase.id
  ) {
    throw new StripeWebhookProcessingError(
      STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_REFERENCE_MISMATCH,
      "Stripe client_reference_id does not match the resolved purchase.",
      {
        purchaseId: purchase.id,
      },
    );
  }

  const syncedPurchase = await syncProviderAmountWithPurchase(
    {
      actualAmount: session.amount_total,
      actualCurrency: session.currency,
      purchase,
    },
    supabase,
  );

  assertAmountMatchesPurchase({
    actualAmount: session.amount_total,
    actualCurrency: session.currency,
    purchase: syncedPurchase,
    amountErrorCode: STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_AMOUNT_MISMATCH,
    currencyErrorCode: STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_CURRENCY_MISMATCH,
  });

  const paymentIntentId = getObjectId(session.payment_intent);

  if (paymentIntentId) {
    await PurchaseService.attachProviderPaymentIntent(
      {
        purchaseId: syncedPurchase.id,
        providerPaymentIntentId: paymentIntentId,
      },
      supabase,
    );
  }

  return syncedPurchase;
}

async function resolvePurchaseFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
  supabase: SupabaseClient<Database>,
) {
  const purchaseByPaymentIntent =
    await PurchaseService.getByProviderPaymentIntentId(
      paymentIntent.id,
      supabase,
    );
  const purchaseByMetadata = await getPurchaseByMetadata(
    paymentIntent.metadata,
    supabase,
  );

  if (
    purchaseByPaymentIntent &&
    purchaseByMetadata &&
    purchaseByPaymentIntent.id !== purchaseByMetadata.id
  ) {
    throw new StripeWebhookProcessingError(
      STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_INTENT_MISMATCH,
      "Stripe PaymentIntent points to two different internal purchases.",
      {
        purchaseId: purchaseByPaymentIntent.id,
      },
    );
  }

  const purchase = purchaseByPaymentIntent ?? purchaseByMetadata;

  if (!purchase) {
    return null;
  }

  assertMetadataMatchesPurchase(purchase, paymentIntent.metadata, {
    purchase: STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_METADATA_MISMATCH,
    profile: STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_METADATA_MISMATCH,
    product: STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_METADATA_MISMATCH,
  });

  const syncedPurchase = await syncProviderAmountWithPurchase(
    {
      actualAmount: paymentIntent.amount,
      actualCurrency: paymentIntent.currency,
      purchase,
    },
    supabase,
  );

  assertAmountMatchesPurchase({
    actualAmount: paymentIntent.amount,
    actualCurrency: paymentIntent.currency,
    purchase: syncedPurchase,
    amountErrorCode: STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_AMOUNT_MISMATCH,
    currencyErrorCode: STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_CURRENCY_MISMATCH,
  });

  if (!syncedPurchase.providerPaymentIntentId) {
    await PurchaseService.attachProviderPaymentIntent(
      {
        purchaseId: syncedPurchase.id,
        providerPaymentIntentId: paymentIntent.id,
      },
      supabase,
    );
  }

  return syncedPurchase;
}

async function processPaymentIntentSucceeded(
  event: Stripe.Event,
  supabase: SupabaseClient<Database>,
): Promise<Purchase | null> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const purchase = await resolvePurchaseFromPaymentIntent(
    paymentIntent,
    supabase,
  );

  if (paymentIntent.status !== "succeeded") {
    throw new StripeWebhookProcessingError(
      STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_STATUS_INVALID,
      "Stripe PaymentIntent is not succeeded.",
      {
        purchaseId: purchase?.id ?? null,
      },
    );
  }

  if (!purchase) {
    return null;
  }

  const confirmedPurchase = await PurchaseService.confirmPayment(
    {
      purchaseId: purchase.id,
      summary: "Payment confirmed by provider webhook.",
    },
    supabase,
  );

  await CommercialFulfillmentService.fulfillPaidPurchase(confirmedPurchase.id);

  return confirmedPurchase;
}

async function processPaymentIntentFailed(
  event: Stripe.Event,
  supabase: SupabaseClient<Database>,
): Promise<Purchase | null> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const purchase = await resolvePurchaseFromPaymentIntent(
    paymentIntent,
    supabase,
  );

  if (!purchase) {
    return null;
  }

  return PurchaseService.failPayment(
    {
      purchaseId: purchase.id,
      summary: "Payment failed by provider webhook.",
    },
    supabase,
  );
}

async function processChargeRefunded(
  event: Stripe.Event,
  supabase: SupabaseClient<Database>,
): Promise<Purchase | null> {
  const charge = event.data.object as Stripe.Charge;
  const paymentIntentId = getObjectId(charge.payment_intent);

  if (!paymentIntentId) {
    return null;
  }

  const purchase =
    await PurchaseService.getByProviderPaymentIntentId(paymentIntentId, supabase);

  if (!purchase) {
    return null;
  }

  assertAmountMatchesPurchase({
    actualAmount: charge.amount,
    actualCurrency: charge.currency,
    purchase,
    amountErrorCode: STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_AMOUNT_MISMATCH,
    currencyErrorCode: STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_CURRENCY_MISMATCH,
  });

  if (charge.amount_refunded <= 0) {
    return purchase;
  }

  const refundedPurchase = await PurchaseService.markRefunded(
    {
      purchaseId: purchase.id,
      amountRefundedMinor: charge.amount_refunded,
      summary: "Refund recorded by provider webhook.",
    },
    supabase,
  );

  if (
    refundedPurchase.amountTotalMinor !== null &&
    refundedPurchase.amountRefundedMinor >= refundedPurchase.amountTotalMinor
  ) {
    await CommercialFulfillmentService.revokePurchaseEnrollment({
      purchaseId: refundedPurchase.id,
      revocationSource: "stripe_refund",
      summary: "Academic access revoked after total refund.",
    });
  }

  return refundedPurchase;
}

async function processChargeDisputeCreated(
  event: Stripe.Event,
  supabase: SupabaseClient<Database>,
): Promise<Purchase | null> {
  const dispute = event.data.object as Stripe.Dispute;
  const paymentIntentId = getObjectId(dispute.payment_intent);

  if (!paymentIntentId) {
    return null;
  }

  const purchase =
    await PurchaseService.getByProviderPaymentIntentId(paymentIntentId, supabase);

  if (!purchase) {
    return null;
  }

  const disputedPurchase = await PurchaseService.markDisputed(
    {
      purchaseId: purchase.id,
      summary: "Dispute opened by provider webhook.",
    },
    supabase,
  );

  await CommercialFulfillmentService.revokePurchaseEnrollment({
    purchaseId: disputedPurchase.id,
    revocationSource: "stripe_dispute",
    summary: "Academic access suspended after dispute opened.",
  });

  return disputedPurchase;
}

async function processChargeDisputeClosed(
  event: Stripe.Event,
  supabase: SupabaseClient<Database>,
): Promise<Purchase | null> {
  const dispute = event.data.object as Stripe.Dispute;
  const paymentIntentId = getObjectId(dispute.payment_intent);

  if (!paymentIntentId) {
    return null;
  }

  const purchase =
    await PurchaseService.getByProviderPaymentIntentId(paymentIntentId, supabase);

  if (!purchase) {
    return null;
  }

  assertAmountMatchesPurchase({
    actualAmount: dispute.amount,
    actualCurrency: dispute.currency,
    purchase,
    amountErrorCode: STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_AMOUNT_MISMATCH,
    currencyErrorCode: STRIPE_CHECKOUT_ERROR_CODES.PAYMENT_CURRENCY_MISMATCH,
  });

  if (dispute.status === "won") {
    const restoredPurchase = await PurchaseService.closeDispute(
      {
        purchaseId: purchase.id,
        outcome: "won",
        summary: "Dispute won by provider webhook.",
      },
      supabase,
    );

    await CommercialFulfillmentService.restorePurchaseEnrollment({
      purchaseId: restoredPurchase.id,
      summary: "Academic access restored after dispute was won.",
    });

    return restoredPurchase;
  }

  const disputedPurchase = await PurchaseService.closeDispute(
    {
      purchaseId: purchase.id,
      outcome: "lost",
      summary: "Dispute lost or closed against the account.",
    },
    supabase,
  );

  await CommercialFulfillmentService.revokePurchaseEnrollment({
    purchaseId: disputedPurchase.id,
    revocationSource: "stripe_dispute",
    summary: "Academic access remains suspended after dispute was lost.",
  });

  return disputedPurchase;
}

async function processSupportedEvent(
  event: Stripe.Event,
  supabase: SupabaseClient<Database>,
): Promise<Purchase | null> {
  switch (event.type) {
    case "checkout.session.completed":
      return processCheckoutSessionCompleted(event, supabase);
    case "payment_intent.succeeded":
      return processPaymentIntentSucceeded(event, supabase);
    case "payment_intent.payment_failed":
      return processPaymentIntentFailed(event, supabase);
    case "charge.refunded":
      return processChargeRefunded(event, supabase);
    case "charge.dispute.created":
      return processChargeDisputeCreated(event, supabase);
    case "charge.dispute.closed":
      return processChargeDisputeClosed(event, supabase);
    default:
      return null;
  }
}

export const StripeWebhookService = {
  async processEvent(event: Stripe.Event): Promise<StripeWebhookProcessingResult> {
    const supabase = getSupabaseAdminClient();

    const webhookRecord =
      await PurchaseService.recordStripeWebhookEventIfAbsent(
      {
        stripeEventId: event.id,
        eventType: event.type,
        apiVersion: event.api_version ?? null,
        livemode: event.livemode,
        processingStatus: "received",
        payloadSummary: buildPayloadSummary(event),
      },
      supabase,
    );

    if (!webhookRecord.created) {
      const existingWebhookEvent = webhookRecord.event;

      if (
        ["processed", "ignored"].includes(
          existingWebhookEvent.processingStatus,
        )
      ) {
        return {
          stripeEventId: event.id,
          status: "duplicate",
          purchaseId: existingWebhookEvent.purchaseId,
        };
      }

      if (
        existingWebhookEvent.processingStatus === "processing" &&
        !isStaleProcessingEvent(existingWebhookEvent.updatedAt)
      ) {
        return {
          stripeEventId: event.id,
          status: "duplicate",
          purchaseId: existingWebhookEvent.purchaseId,
        };
      }
    }

    await PurchaseService.markWebhookProcessing(event.id, supabase);

    if (!supportedStripeWebhookEvents.has(event.type)) {
      await PurchaseService.markWebhookIgnored(event.id, supabase);

      return {
        stripeEventId: event.id,
        status: "ignored",
        purchaseId: null,
      };
    }

    try {
      const purchase = await processSupportedEvent(event, supabase);

      if (!purchase) {
        return failWithoutPurchase(
          event.id,
          "No internal purchase exists for this Stripe event.",
          supabase,
        );
      }

      await PurchaseService.markWebhookProcessed(
        event.id,
        {
          purchaseId: purchase.id,
        },
        supabase,
      );

      return {
        stripeEventId: event.id,
        status: "processed",
        purchaseId: purchase.id,
      };
    } catch (error) {
      const webhookError =
        error instanceof StripeWebhookProcessingError ? error : null;
      const fulfillmentError =
        error instanceof CommercialFulfillmentError ? error : null;
      const fallbackErrorCode =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code: string }).code
          : "WEBHOOK_PROCESSING_ERROR";
      const lastErrorCode =
        webhookError?.code ?? fulfillmentError?.code ?? fallbackErrorCode;
      const isPermanent =
        fulfillmentError?.isPermanent ??
        permanentWebhookErrorCodes.has(lastErrorCode);
      const purchaseId =
        webhookError?.purchaseId ?? fulfillmentError?.purchaseId ?? null;

      await PurchaseService.markWebhookFailed(
        event.id,
        {
          lastErrorCode,
          errorMessage: getSafeErrorMessage(error),
          purchaseId,
        },
        supabase,
      );

      return {
        stripeEventId: event.id,
        status: isPermanent ? "permanent_failure" : "retryable_failure",
        purchaseId,
      };
    }
  },
};
