import type { SupabaseClient } from "@supabase/supabase-js";

import { PurchaseEventRepository } from "@/lib/repositories/purchase-event.repository";
import { PurchaseRepository } from "@/lib/repositories/purchase.repository";
import { StripeWebhookEventRepository } from "@/lib/repositories/stripe-webhook-event.repository";
import type { Database } from "@/lib/supabase/database.types";
import type {
  AttachProviderCheckoutSessionInput,
  AttachProviderPaymentIntentInput,
  CreatePurchaseEventInput,
  CreatePurchaseInput,
  CreateStripeWebhookEventInput,
  Purchase,
  PurchaseEvent,
  PurchaseStatus,
  StripeWebhookEvent,
} from "@/lib/types/commercial.types";

type PurchaseStatusOperationInput = {
  purchaseId: string;
  summary?: string | null;
};

type RefundOperationInput = PurchaseStatusOperationInput & {
  amountRefundedMinor: number;
};

type PurchaseTransitionResult = {
  purchase: Purchase;
  changed: boolean;
};

class PurchaseDomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PurchaseDomainError";
    this.code = code;
  }
}

function assertSafeMinorAmount(value: number, fieldName: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new PurchaseDomainError(
      "PURCHASE_AMOUNT_INVALID",
      `${fieldName} must be a non-negative safe integer.`,
    );
  }
}

function canTransitionPurchase(
  purchase: Purchase,
  targetStatus: PurchaseStatus,
) {
  if (purchase.status === targetStatus) {
    return true;
  }

  if (purchase.status === "pending") {
    return ["paid", "failed", "canceled"].includes(targetStatus);
  }

  if (purchase.status === "failed") {
    return targetStatus === "paid" && Boolean(purchase.providerPaymentIntentId);
  }

  if (purchase.status === "paid") {
    return ["partially_refunded", "refunded", "disputed"].includes(
      targetStatus,
    );
  }

  if (purchase.status === "partially_refunded") {
    return ["refunded", "disputed"].includes(targetStatus);
  }

  if (purchase.status === "disputed") {
    return ["paid", "refunded"].includes(targetStatus);
  }

  return false;
}

async function transitionPurchaseStatus(
  input: {
    purchaseId: string;
    status: PurchaseStatus;
  },
  supabase?: SupabaseClient<Database>,
): Promise<PurchaseTransitionResult> {
  const currentPurchase = await PurchaseRepository.getById(
    input.purchaseId,
    supabase,
  );

  if (!currentPurchase) {
    throw new PurchaseDomainError(
      "PURCHASE_NOT_FOUND",
      "Purchase was not found.",
    );
  }

  if (currentPurchase.status === input.status) {
    return {
      purchase: currentPurchase,
      changed: false,
    };
  }

  if (!canTransitionPurchase(currentPurchase, input.status)) {
    throw new PurchaseDomainError(
      "PURCHASE_STATE_TRANSITION_INVALID",
      `Cannot transition purchase from ${currentPurchase.status} to ${input.status}.`,
    );
  }

  const updatedPurchase = await PurchaseRepository.updateStatus(
    {
      purchaseId: input.purchaseId,
      status: input.status,
    },
    supabase,
  );

  return {
    purchase: updatedPurchase,
    changed: true,
  };
}

export const PurchaseService = {
  getById(
    purchaseId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase | null> {
    return PurchaseRepository.getById(purchaseId, supabase);
  },

  getByProviderCheckoutSessionId(
    checkoutSessionId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase | null> {
    return PurchaseRepository.getByProviderCheckoutSessionId(
      "stripe",
      checkoutSessionId,
      supabase,
    );
  },

  getByProviderPaymentIntentId(
    paymentIntentId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase | null> {
    return PurchaseRepository.getByProviderPaymentIntentId(
      "stripe",
      paymentIntentId,
      supabase,
    );
  },

  getPendingPurchaseForProfileAndProduct(
    input: {
      profileId: string;
      productId: string;
      createdAfter?: string;
    },
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase | null> {
    return PurchaseRepository.getRecentPendingByProfileAndProduct(
      input,
      supabase,
    );
  },

  createPendingPurchase(
    input: Omit<CreatePurchaseInput, "status">,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase> {
    return PurchaseRepository.create(
      {
        ...input,
        status: "pending",
      },
      supabase,
    );
  },

  attachProviderCheckoutSession(
    input: AttachProviderCheckoutSessionInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase> {
    return PurchaseRepository.attachProviderCheckoutSession(input, supabase);
  },

  attachProviderPaymentIntent(
    input: AttachProviderPaymentIntentInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase> {
    return PurchaseRepository.attachProviderPaymentIntent(input, supabase);
  },

  recordEvent(
    input: CreatePurchaseEventInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<PurchaseEvent> {
    return PurchaseEventRepository.create(input, supabase);
  },

  recordPurchaseEvent(
    input: CreatePurchaseEventInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<PurchaseEvent> {
    return PurchaseEventRepository.create(input, supabase);
  },

  updatePurchaseStatus(
    purchaseId: string,
    status: PurchaseStatus,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase> {
    return PurchaseRepository.updateStatus(
      {
        purchaseId,
        status,
      },
      supabase,
    );
  },

  async markCheckoutCreationFailed(
    input: PurchaseStatusOperationInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase> {
    const result = await transitionPurchaseStatus(
      {
        purchaseId: input.purchaseId,
        status: "canceled",
      },
      supabase,
    );

    if (result.changed) {
      await PurchaseEventRepository.create(
        {
          purchaseId: result.purchase.id,
          eventType: "purchase_canceled",
          source: "system",
          summary:
            input.summary ??
            "Checkout creation failed before a usable payment session was returned.",
        },
        supabase,
      );
    }

    return result.purchase;
  },

  recordPaymentPending(
    input: PurchaseStatusOperationInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<PurchaseEvent> {
    return PurchaseEventRepository.create(
      {
        purchaseId: input.purchaseId,
        eventType: "payment_pending",
        source: "system",
        summary:
          input.summary ??
          "Checkout session created; awaiting payment confirmation.",
      },
      supabase,
    );
  },

  recordStripeWebhookEvent(
    input: CreateStripeWebhookEventInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<StripeWebhookEvent> {
    return StripeWebhookEventRepository.createReceived(input, supabase);
  },

  recordStripeWebhookEventIfAbsent(
    input: CreateStripeWebhookEventInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<{
    event: StripeWebhookEvent;
    created: boolean;
  }> {
    return StripeWebhookEventRepository.createReceivedIfAbsent(input, supabase);
  },

  getStripeWebhookEvent(
    stripeEventId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<StripeWebhookEvent | null> {
    return StripeWebhookEventRepository.getByStripeEventId(
      stripeEventId,
      supabase,
    );
  },

  async markWebhookProcessing(
    stripeEventId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<StripeWebhookEvent> {
    const webhookEvent =
      await StripeWebhookEventRepository.getByStripeEventId(
        stripeEventId,
        supabase,
      );

    return StripeWebhookEventRepository.markProcessing(
      stripeEventId,
      {
        attemptCount: (webhookEvent?.attemptCount ?? 0) + 1,
      },
      supabase,
    );
  },

  markWebhookProcessed(
    stripeEventId: string,
    input: {
      purchaseId?: string | null;
    } = {},
    supabase?: SupabaseClient<Database>,
  ): Promise<StripeWebhookEvent> {
    return StripeWebhookEventRepository.markProcessed(
      stripeEventId,
      input,
      supabase,
    );
  },

  markWebhookFailed(
    stripeEventId: string,
    input: {
      lastErrorCode?: string | null;
      errorMessage?: string | null;
      purchaseId?: string | null;
    },
    supabase?: SupabaseClient<Database>,
  ): Promise<StripeWebhookEvent> {
    return StripeWebhookEventRepository.markFailed(
      stripeEventId,
      input,
      supabase,
    );
  },

  markWebhookIgnored(
    stripeEventId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<StripeWebhookEvent> {
    return StripeWebhookEventRepository.markIgnored(stripeEventId, {}, supabase);
  },

  async confirmPayment(
    input: PurchaseStatusOperationInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase> {
    const result = await transitionPurchaseStatus(
      {
        purchaseId: input.purchaseId,
        status: "paid",
      },
      supabase,
    );

    if (result.changed) {
      await PurchaseEventRepository.create(
        {
          purchaseId: result.purchase.id,
          eventType: "payment_confirmed",
          source: "stripe_webhook",
          summary: input.summary ?? "Payment confirmed.",
        },
        supabase,
      );
    }

    return result.purchase;
  },

  async failPayment(
    input: PurchaseStatusOperationInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase> {
    const currentPurchase = await PurchaseRepository.getById(
      input.purchaseId,
      supabase,
    );

    if (!currentPurchase) {
      throw new PurchaseDomainError(
        "PURCHASE_NOT_FOUND",
        "Purchase was not found.",
      );
    }

    if (
      ["paid", "refunded", "partially_refunded", "disputed"].includes(
        currentPurchase.status,
      )
    ) {
      return currentPurchase;
    }

    const result = await transitionPurchaseStatus(
      {
        purchaseId: input.purchaseId,
        status: "failed",
      },
      supabase,
    );

    if (result.changed) {
      await PurchaseEventRepository.create(
        {
          purchaseId: result.purchase.id,
          eventType: "payment_failed",
          source: "stripe_webhook",
          summary: input.summary ?? "Payment failed.",
        },
        supabase,
      );
    }

    return result.purchase;
  },

  async markRefunded(
    input: RefundOperationInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase> {
    assertSafeMinorAmount(input.amountRefundedMinor, "amountRefundedMinor");

    const currentPurchase = await PurchaseRepository.getById(
      input.purchaseId,
      supabase,
    );

    if (!currentPurchase) {
      throw new PurchaseDomainError(
        "PURCHASE_NOT_FOUND",
        "Purchase was not found.",
      );
    }

    if (currentPurchase.amountTotalMinor === null) {
      throw new PurchaseDomainError(
        "PURCHASE_AMOUNT_INVALID",
        "Purchase total amount is required before recording a refund.",
      );
    }

    if (input.amountRefundedMinor > currentPurchase.amountTotalMinor) {
      throw new PurchaseDomainError(
        "PURCHASE_AMOUNT_INVALID",
        "Refunded amount cannot exceed purchase total.",
      );
    }

    if (input.amountRefundedMinor <= currentPurchase.amountRefundedMinor) {
      return currentPurchase;
    }

    const targetStatus =
      input.amountRefundedMinor >= currentPurchase.amountTotalMinor
        ? "refunded"
        : "partially_refunded";

    if (currentPurchase.status === "refunded") {
      return currentPurchase;
    }

    if (!canTransitionPurchase(currentPurchase, targetStatus)) {
      throw new PurchaseDomainError(
        "PURCHASE_STATE_TRANSITION_INVALID",
        `Cannot transition purchase from ${currentPurchase.status} to ${targetStatus}.`,
      );
    }

    const purchase = await PurchaseRepository.updateRefund(
      {
        purchaseId: input.purchaseId,
        status: targetStatus,
        amountRefundedMinor: input.amountRefundedMinor,
      },
      supabase,
    );

    await PurchaseEventRepository.create(
      {
        purchaseId: purchase.id,
        eventType: targetStatus === "partially_refunded"
          ? "partial_refund_completed"
          : "refund_completed",
        source: "stripe_webhook",
        summary: input.summary ?? "Refund recorded.",
      },
      supabase,
    );

    return purchase;
  },

  async markDisputed(
    input: PurchaseStatusOperationInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<Purchase> {
    const currentPurchase = await PurchaseRepository.getById(
      input.purchaseId,
      supabase,
    );

    if (!currentPurchase) {
      throw new PurchaseDomainError(
        "PURCHASE_NOT_FOUND",
        "Purchase was not found.",
      );
    }

    if (
      ["refunded", "canceled", "failed"].includes(currentPurchase.status)
    ) {
      return currentPurchase;
    }

    const result = await transitionPurchaseStatus(
      {
        purchaseId: input.purchaseId,
        status: "disputed",
      },
      supabase,
    );

    if (result.changed) {
      await PurchaseEventRepository.create(
        {
          purchaseId: result.purchase.id,
          eventType: "dispute_opened",
          source: "stripe_webhook",
          summary: input.summary ?? "Dispute opened.",
        },
        supabase,
      );
    }

    return result.purchase;
  },
};
