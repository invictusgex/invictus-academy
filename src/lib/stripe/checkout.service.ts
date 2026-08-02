import "server-only";

import type Stripe from "stripe";

import { PurchaseService } from "@/lib/services/purchase.service";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripeCheckoutConfig } from "@/lib/stripe/stripe-config";
import {
  getCheckoutProductConfig,
  type CheckoutProductSlug,
} from "@/lib/stripe/checkout-catalog";
import {
  STRIPE_CHECKOUT_ERROR_CODES,
  StripeCheckoutError,
  StripeConfigurationError,
  StripeServerUnavailableError,
} from "@/lib/stripe/stripe-errors";
import { getStripeServer } from "@/lib/stripe/stripe-server";
import type { Purchase } from "@/lib/types/commercial.types";

const pendingPurchaseWindowMs = 15 * 60 * 1000;

export type CreateCheckoutSessionInput = {
  profileId: string;
  userEmail: string | null;
  productSlug: CheckoutProductSlug;
  internalProductId: string;
  environment: string;
};

export type CreateCheckoutSessionResult = {
  url: string;
};

function buildCheckoutUrl(pathname: string) {
  const checkoutConfig = getStripeCheckoutConfig();
  const url = new URL(pathname, checkoutConfig.appUrl);

  return url.toString();
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

function normalizeStripeCurrency(currency: string) {
  const normalizedCurrency = currency.toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
    throw new StripeCheckoutError(
      STRIPE_CHECKOUT_ERROR_CODES.PRICE_NOT_PURCHASABLE,
      "La moneda configurada para este producto no es valida.",
      {
        status: 500,
      },
    );
  }

  return normalizedCurrency;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

async function getPurchasablePrice(stripe: Stripe, priceId: string) {
  const price = await stripe.prices.retrieve(priceId);

  if (!price.active || price.type !== "one_time" || price.recurring) {
    throw new StripeCheckoutError(
      STRIPE_CHECKOUT_ERROR_CODES.PRICE_NOT_PURCHASABLE,
      "El precio configurado no está habilitado para pago ?nico.",
      {
        status: 500,
      },
    );
  }

  if (price.unit_amount === null) {
    throw new StripeCheckoutError(
      STRIPE_CHECKOUT_ERROR_CODES.PRICE_AMOUNT_UNAVAILABLE,
      "Stripe no devolvio un importe entero para este precio.",
      {
        status: 500,
      },
    );
  }

  return {
    amountTotalMinor: price.unit_amount,
    currency: normalizeStripeCurrency(price.currency),
  };
}

async function tryMarkCheckoutCreationFailed(
  purchaseId: string,
  summary: string,
) {
  try {
    await PurchaseService.markCheckoutCreationFailed(
      {
        purchaseId,
        summary,
      },
      getSupabaseAdminClient(),
    );
  } catch {
    // Compensation failures are intentionally swallowed here so the caller can
    // return the original controlled Checkout error without exposing internals.
  }
}

async function tryExpireCheckoutSession(
  stripe: Stripe,
  checkoutSessionId: string,
  checkoutSessionStatus?: Stripe.Checkout.Session.Status | null,
) {
  if (checkoutSessionStatus && checkoutSessionStatus !== "open") {
    return;
  }

  try {
    await stripe.checkout.sessions.expire(checkoutSessionId);
  } catch (error) {
    throw new StripeCheckoutError(
      STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_SESSION_EXPIRATION_FAILED,
      "No se pudo expirar una sesión de Checkout sin trazabilidad local.",
      {
        cause: error,
      },
    );
  }
}

async function compensateUnusableCheckoutSession(
  stripe: Stripe,
  input: {
    checkoutSessionId: string;
    checkoutSessionStatus?: Stripe.Checkout.Session.Status | null;
    purchaseId: string;
    summary: string;
  },
) {
  await tryMarkCheckoutCreationFailed(input.purchaseId, input.summary);
  await tryExpireCheckoutSession(
    stripe,
    input.checkoutSessionId,
    input.checkoutSessionStatus,
  );
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CreateCheckoutSessionResult> {
  try {
    const productConfig = getCheckoutProductConfig(input.productSlug);
    const supabase = getSupabaseAdminClient();
    const stripe = getStripeServer();
    const price = await getPurchasablePrice(stripe, productConfig.priceId);
    const pendingPurchaseCutoff = new Date(
      Date.now() - pendingPurchaseWindowMs,
    );
    const existingPendingPurchase =
      await PurchaseService.getPendingPurchaseForProfileAndProduct(
        {
          profileId: input.profileId,
          productId: input.internalProductId,
        },
        supabase,
      );

    if (existingPendingPurchase) {
      const pendingCreatedAt = new Date(existingPendingPurchase.createdAt);

      if (pendingCreatedAt >= pendingPurchaseCutoff) {
        throw new StripeCheckoutError(
          STRIPE_CHECKOUT_ERROR_CODES.DUPLICATE_PENDING_PURCHASE,
          "Ya existe una compra pendiente reciente para este producto.",
          {
            status: 409,
          },
        );
      }

      await PurchaseService.markCheckoutCreationFailed(
        {
          purchaseId: existingPendingPurchase.id,
          summary:
            "Expired pending purchase canceled before creating a new Checkout.",
        },
        supabase,
      );
    }

    let purchase: Purchase;

    try {
      purchase = await PurchaseService.createPendingPurchase(
        {
          profileId: input.profileId,
          productId: input.internalProductId,
          paymentProvider: "stripe",
          amountTotalMinor: price.amountTotalMinor,
          currency: price.currency,
        },
        supabase,
      );
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new StripeCheckoutError(
          STRIPE_CHECKOUT_ERROR_CODES.DUPLICATE_PENDING_PURCHASE,
          "Ya existe una compra pendiente para este producto.",
          {
            status: 409,
            cause: error,
          },
        );
      }

      throw new StripeCheckoutError(
        STRIPE_CHECKOUT_ERROR_CODES.PURCHASE_CREATION_FAILED,
        "No se pudo registrar la compra antes de iniciar Checkout.",
        {
          cause: error,
        },
      );
    }

    try {
      await PurchaseService.recordPurchaseEvent(
        {
          purchaseId: purchase.id,
          eventType: "purchase_created",
          source: "system",
          summary: "Purchase created before Stripe Checkout.",
        },
        supabase,
      );
    } catch (error) {
      await tryMarkCheckoutCreationFailed(
        purchase.id,
        "Purchase event creation failed before Stripe Checkout.",
      );

      throw new StripeCheckoutError(
        STRIPE_CHECKOUT_ERROR_CODES.PURCHASE_EVENT_CREATION_FAILED,
        "No se pudo registrar el evento inicial de la compra.",
        {
          cause: error,
        },
      );
    }

    const metadata = {
      purchase_id: purchase.id,
      purchase_number: purchase.purchaseNumber,
      profile_id: input.profileId,
      product_slug: input.productSlug,
      internal_product_id: input.internalProductId,
      environment: input.environment,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      line_items: [
        {
          price: productConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: buildCheckoutUrl(
        "/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      ),
      cancel_url: buildCheckoutUrl("/oferta"),
      client_reference_id: purchase.id,
      customer_email: input.userEmail ?? undefined,
      metadata,
      payment_intent_data: {
        metadata,
      },
    }, {
      idempotencyKey: `checkout-session:${purchase.id}`,
    });

    if (!session.url) {
      await compensateUnusableCheckoutSession(stripe, {
        checkoutSessionId: session.id,
        checkoutSessionStatus: session.status,
        purchaseId: purchase.id,
        summary: "Stripe Checkout did not return a usable URL.",
      });

      throw new StripeCheckoutError(
        STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_CREATION_FAILED,
        "Stripe no devolvio una URL de Checkout.",
      );
    }

    try {
      await PurchaseService.attachProviderCheckoutSession(
        {
          purchaseId: purchase.id,
          providerCheckoutSessionId: session.id,
          providerPaymentIntentId: getObjectId(session.payment_intent),
        },
        supabase,
      );
    } catch (error) {
      await compensateUnusableCheckoutSession(stripe, {
        checkoutSessionId: session.id,
        checkoutSessionStatus: session.status,
        purchaseId: purchase.id,
        summary: "Checkout session could not be attached to the local purchase.",
      });

      throw new StripeCheckoutError(
        STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_SESSION_ATTACH_FAILED,
        "No se pudo asociar Checkout con la compra interna.",
        {
          cause: error,
        },
      );
    }

    try {
      await PurchaseService.recordPaymentPending(
        {
          purchaseId: purchase.id,
          summary: "Stripe Checkout session created for this purchase.",
        },
        supabase,
      );
    } catch (error) {
      await compensateUnusableCheckoutSession(stripe, {
        checkoutSessionId: session.id,
        checkoutSessionStatus: session.status,
        purchaseId: purchase.id,
        summary:
          "Payment pending event could not be recorded after Checkout creation.",
      });

      throw new StripeCheckoutError(
        STRIPE_CHECKOUT_ERROR_CODES.PURCHASE_EVENT_CREATION_FAILED,
        "No se pudo registrar el evento pendiente de pago.",
        {
          cause: error,
        },
      );
    }

    return {
      url: session.url,
    };
  } catch (error) {
    if (error instanceof StripeCheckoutError) {
      throw error;
    }

    if (
      error instanceof StripeConfigurationError ||
      error instanceof StripeServerUnavailableError
    ) {
      throw new StripeCheckoutError(
        STRIPE_CHECKOUT_ERROR_CODES.STRIPE_NOT_CONFIGURED,
        "Stripe Checkout no está configurado en este entorno.",
        {
          cause: error,
        },
      );
    }

    throw new StripeCheckoutError(
      STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_CREATION_FAILED,
      "No se pudo crear la sesión de Checkout.",
      {
        cause: error,
      },
    );
  }
}
