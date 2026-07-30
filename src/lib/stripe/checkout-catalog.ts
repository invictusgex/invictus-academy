import "server-only";

import { getStripeCheckoutConfig } from "@/lib/stripe/stripe-config";

export const allowedCheckoutProductSlugs = [
  "trading-basado-en-datos",
] as const;

export type CheckoutProductSlug = (typeof allowedCheckoutProductSlugs)[number];

export type CheckoutProductConfig = {
  slug: CheckoutProductSlug;
  name: string;
  priceId: string;
};

export function isCheckoutProductSlug(
  value: string,
): value is CheckoutProductSlug {
  return allowedCheckoutProductSlugs.some((slug) => slug === value);
}

export function getCheckoutProductConfig(
  slug: CheckoutProductSlug,
): CheckoutProductConfig {
  const checkoutConfig = getStripeCheckoutConfig();

  return {
    slug,
    name: "Invictus Trading Academy - Mentoria Grabada",
    priceId: checkoutConfig.mentorshipPriceId,
  };
}
