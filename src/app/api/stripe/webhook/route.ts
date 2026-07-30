import { NextResponse } from "next/server";

import { getStripeWebhookConfig } from "@/lib/stripe/stripe-config";
import {
  StripeConfigurationError,
  StripeServerUnavailableError,
} from "@/lib/stripe/stripe-errors";
import { getStripeServer } from "@/lib/stripe/stripe-server";
import { StripeWebhookService } from "@/lib/stripe/stripe-webhook.service";

export const runtime = "nodejs";

function jsonResponse(
  body: {
    received: boolean;
    status?: string;
    error?: string;
  },
  status: number,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return jsonResponse(
      {
        received: false,
        error: "Missing Stripe signature.",
      },
      400,
    );
  }

  const rawBody = await request.text();

  let event;

  try {
    const stripe = getStripeServer();
    const config = getStripeWebhookConfig();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.webhookSecret,
    );
  } catch (error) {
    if (
      error instanceof StripeConfigurationError ||
      error instanceof StripeServerUnavailableError
    ) {
      return jsonResponse(
        {
          received: false,
          error: "Stripe webhook is not configured.",
        },
        500,
      );
    }

    return jsonResponse(
      {
        received: false,
        error: "Invalid Stripe signature.",
      },
      400,
    );
  }

  try {
    const result = await StripeWebhookService.processEvent(event);

    return jsonResponse(
      {
        received: true,
        status: result.status,
      },
      result.status === "retryable_failure" ? 500 : 200,
    );
  } catch {
    return jsonResponse(
      {
        received: false,
        error: "Webhook processing failed.",
      },
      500,
    );
  }
}
