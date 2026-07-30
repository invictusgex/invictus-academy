import Stripe from "stripe";

import { getStripeServerConfig, stripeSdkStatus } from "@/lib/stripe/stripe-config";
import { StripeServerUnavailableError } from "@/lib/stripe/stripe-errors";

let stripeServerInstance: Stripe | null = null;

export function assertStripeServerConfigured() {
  return getStripeServerConfig();
}

export function getStripeServer() {
  const config = assertStripeServerConfigured();

  if (!stripeSdkStatus.installed) {
    throw new StripeServerUnavailableError(
      `Stripe SDK is not installed. Install ${stripeSdkStatus.recommendedPackage} before enabling checkout or webhooks.`,
    );
  }

  stripeServerInstance ??= new Stripe(config.secretKey);

  return stripeServerInstance;
}
