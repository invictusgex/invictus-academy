import type Stripe from "stripe";

export function hasPaidLiveRoomAccess(subscription: Stripe.Subscription | null, now = Date.now()) {
  const invoice = subscription?.latest_invoice;
  const paidThrough = subscription?.items.data[0]?.current_period_end;
  return subscription?.status === "active" && Boolean(invoice && typeof invoice !== "string" && invoice.status === "paid") && Boolean(paidThrough && paidThrough * 1000 > now);
}

export function compareLiveRoomRole(expected: boolean | null, actual: boolean | null): "unknown" | "missing_role" | "unexpected_role" | "correct" {
  if (expected === null || actual === null) return "unknown";
  if (expected && !actual) return "missing_role";
  if (!expected && actual) return "unexpected_role";
  return "correct";
}
