import { StripeConfigurationError } from "@/lib/stripe/stripe-errors";
import type {
  StripeCheckoutConfig,
  StripeClientConfig,
  StripeEnvironmentVariable,
  StripeRuntimeConfig,
  StripeSdkStatus,
  StripeServerConfig,
  StripeWebhookConfig,
} from "@/lib/stripe/stripe-types";

export const recommendedStripePackage = "stripe@latest";

export const stripeSdkStatus: StripeSdkStatus = {
  installed: true,
  recommendedPackage: null,
};

function readRequiredEnv(name: StripeEnvironmentVariable) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new StripeConfigurationError(
      `Missing required Stripe environment variable: ${name}.`,
    );
  }

  return value;
}

export function getStripeServerConfig(): StripeServerConfig {
  return {
    secretKey: readRequiredEnv("STRIPE_SECRET_KEY"),
  };
}

export function getStripeCheckoutConfig(): StripeCheckoutConfig {
  return {
    appUrl: readRequiredEnv("APP_URL"),
    mentorshipPriceId: readRequiredEnv("STRIPE_MENTORSHIP_PRICE_ID"),
  };
}

export function getStripeWebhookConfig(): StripeWebhookConfig {
  return {
    webhookSecret: readRequiredEnv("STRIPE_WEBHOOK_SECRET"),
  };
}

export function getStripeClientConfig(): StripeClientConfig {
  return {
    publishableKey: readRequiredEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  };
}

export function getStripeRuntimeConfig(): StripeRuntimeConfig {
  return {
    client: getStripeClientConfig(),
    checkout: getStripeCheckoutConfig(),
    server: getStripeServerConfig(),
    webhook: getStripeWebhookConfig(),
  };
}
