import { NextResponse } from "next/server";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import { requireServerAuthContext } from "@/lib/auth/server";
import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import { ProductRepository } from "@/lib/repositories/product.repository";
import {
  checkRateLimit,
  createRateLimitResponse,
  getRateLimitIdentity,
} from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isCheckoutProductSlug,
} from "@/lib/stripe/checkout-catalog";
import { createCheckoutSession } from "@/lib/stripe/checkout.service";
import {
  STRIPE_CHECKOUT_ERROR_CODES,
  StripeCheckoutError,
} from "@/lib/stripe/stripe-errors";

export const runtime = "nodejs";

type CheckoutResponseBody =
  | {
      url: string;
      recoveredPendingSession?: boolean;
    }
  | {
      error: {
        code: string;
        message: string;
      };
    };

const forbiddenCheckoutFields = new Set([
  "amount",
  "price",
  "currency",
  "priceId",
  "stripePriceId",
  "stripeProductId",
  "customer",
  "customerId",
  "profileId",
  "userId",
  "email",
  "discount",
  "coupon",
  "metadata",
  "successUrl",
  "cancelUrl",
  "quantity",
]);

function jsonResponse(body: CheckoutResponseBody, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function createCheckoutError(
  code: keyof typeof STRIPE_CHECKOUT_ERROR_CODES,
  message: string,
  status: number,
) {
  return new StripeCheckoutError(STRIPE_CHECKOUT_ERROR_CODES[code], message, {
    status,
  });
}

async function readCheckoutPayload(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    throw createCheckoutError(
      "INVALID_CHECKOUT_REQUEST",
      "La solicitud debe enviarse como application/json.",
      400,
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw createCheckoutError(
      "INVALID_CHECKOUT_REQUEST",
      "El cuerpo de la solicitud no contiene JSON válido.",
      400,
    );
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createCheckoutError(
      "INVALID_CHECKOUT_REQUEST",
      "El cuerpo de la solicitud debe ser un objeto JSON.",
      400,
    );
  }

  const body = payload as Record<string, unknown>;
  const keys = Object.keys(body);
  const forbiddenField = keys.find((key) => forbiddenCheckoutFields.has(key));

  if (forbiddenField || keys.some((key) => key !== "productSlug")) {
    throw createCheckoutError(
      "INVALID_CHECKOUT_REQUEST",
      "La solicitud solo puede incluir productSlug.",
      400,
    );
  }

  if (typeof body.productSlug !== "string") {
    throw createCheckoutError(
      "INVALID_CHECKOUT_REQUEST",
      "productSlug debe ser un texto válido.",
      400,
    );
  }

  if (!isCheckoutProductSlug(body.productSlug)) {
    throw createCheckoutError(
      "INVALID_CHECKOUT_REQUEST",
      "El producto solicitado no está habilitado para Checkout.",
      400,
    );
  }

  return {
    productSlug: body.productSlug,
  };
}

function mapAuthError(error: ServerAuthError) {
  if (error.code === SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED) {
    return new StripeCheckoutError(
      STRIPE_CHECKOUT_ERROR_CODES.UNAUTHENTICATED,
      "Debes iniciar sesión para continuar con la compra.",
      {
        status: 401,
        cause: error,
      },
    );
  }

  if (error.code === SERVER_AUTH_ERROR_CODES.PROFILE_NOT_FOUND) {
    return new StripeCheckoutError(
      STRIPE_CHECKOUT_ERROR_CODES.PROFILE_NOT_FOUND,
      "No encontramos un perfil asociado a tu cuenta.",
      {
        status: 500,
        cause: error,
      },
    );
  }

  return new StripeCheckoutError(
    STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_CREATION_FAILED,
    "No pudimos validar tu sesión para iniciar Checkout.",
    {
      cause: error,
    },
  );
}

function mapCheckoutError(error: unknown) {
  if (error instanceof StripeCheckoutError) {
    return error;
  }

  if (error instanceof ServerAuthError) {
    return mapAuthError(error);
  }

  return new StripeCheckoutError(
    STRIPE_CHECKOUT_ERROR_CODES.CHECKOUT_CREATION_FAILED,
    "No pudimos crear la sesión de Checkout.",
    {
      cause: error,
    },
  );
}

export async function POST(request: Request) {
  try {
    const payload = await readCheckoutPayload(request);
    const { user, profile } = await requireServerAuthContext();
    const rateLimit = checkRateLimit({
      key: `stripe:checkout:${getRateLimitIdentity(request, profile.id)}`,
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        "Demasiados intentos de iniciar Checkout. Intenta nuevamente en unos minutos.",
        rateLimit.retryAfterSeconds,
      );
    }

    const supabase = await createSupabaseServerClient();
    const product = await ProductRepository.getBySlug(
      supabase,
      payload.productSlug,
    );

    if (!product) {
      throw new StripeCheckoutError(
        STRIPE_CHECKOUT_ERROR_CODES.PRODUCT_NOT_FOUND,
        "No encontramos el producto solicitado.",
        {
          status: 404,
        },
      );
    }

    if (
      product.slug !== payload.productSlug ||
      !isCheckoutProductSlug(product.slug)
    ) {
      throw new StripeCheckoutError(
        STRIPE_CHECKOUT_ERROR_CODES.PRODUCT_NOT_PURCHASABLE,
        "Este producto no está habilitado para compra.",
        {
          status: 500,
        },
      );
    }

    if (product.status !== "active") {
      throw new StripeCheckoutError(
        STRIPE_CHECKOUT_ERROR_CODES.PRODUCT_NOT_PURCHASABLE,
        "Este producto no está disponible para compra.",
        {
          status: 500,
        },
      );
    }

    const enrollment = await EnrollmentRepository.getEnrollmentByProductId(
      {
        profileId: profile.id,
        productId: product.id,
      },
      supabase,
    );

    if (enrollment?.status === "active") {
      throw new StripeCheckoutError(
        STRIPE_CHECKOUT_ERROR_CODES.ALREADY_ENROLLED,
        "Ya tienes acceso activo a este programa.",
        {
          status: 409,
        },
      );
    }

    const checkoutSession = await createCheckoutSession({
      profileId: profile.id,
      userEmail: user.email ?? profile.email,
      productSlug: payload.productSlug,
      internalProductId: product.id,
      environment: process.env.NODE_ENV ?? "development",
    });

    return jsonResponse(
      {
        url: checkoutSession.url,
        recoveredPendingSession: checkoutSession.recoveredPendingSession,
      },
      200,
    );
  } catch (error) {
    const checkoutError = mapCheckoutError(error);

    return jsonResponse(
      {
        error: {
          code: checkoutError.code,
          message: checkoutError.message,
        },
      },
      checkoutError.status,
    );
  }
}
