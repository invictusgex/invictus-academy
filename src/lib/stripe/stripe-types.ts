export type StripeEnvironmentVariable =
  | "APP_URL"
  | "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  | "STRIPE_MENTORSHIP_PRICE_ID"
  | "STRIPE_SECRET_KEY"
  | "STRIPE_WEBHOOK_SECRET";

export type StripeServerConfig = {
  secretKey: string;
};

export type StripeCheckoutConfig = {
  appUrl: string;
  mentorshipPriceId: string;
};

export type StripeWebhookConfig = {
  webhookSecret: string;
};

export type StripeClientConfig = {
  publishableKey: string;
};

export type StripeRuntimeConfig = {
  client: StripeClientConfig;
  checkout: StripeCheckoutConfig;
  server: StripeServerConfig;
  webhook: StripeWebhookConfig;
};

export type StripeSdkStatus =
  | {
      installed: true;
      recommendedPackage: null;
    }
  | {
      installed: false;
      recommendedPackage: string;
    };
