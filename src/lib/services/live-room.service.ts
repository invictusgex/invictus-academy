import "server-only";
import { randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";
import type Stripe from "stripe";

import { liveRoom } from "@/content/live-room";
import { LiveRoomRepository as repository } from "@/lib/repositories/live-room.repository";
import { DiscordMembershipService as discord } from "@/lib/services/discord-membership.service";
import { getLiveRoomStripe, liveRoomAppUrl, liveRoomEnv, liveRoomIsLive } from "@/lib/services/live-room-config";
import type { LiveRoomAccountRow, LiveRoomOffer } from "@/lib/types/live-room.types";

const membershipPath = "/sala-en-vivo/suscripcion";
const blockingStatuses = new Set(["active", "trialing", "past_due", "unpaid", "paused", "incomplete"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const objectId = (value: string | { id: string } | null | undefined) => typeof value === "string" ? value : value?.id ?? null;

async function currentPrice() {
  const stripe = getLiveRoomStripe();
  const product = await stripe.products.retrieve(liveRoomEnv("STRIPE_LIVE_ROOM_PRODUCT_ID"));
  if (!product.active) throw new Error("LIVE_ROOM_PRICE_UNAVAILABLE");
  const priceId = objectId(product.default_price) || liveRoomEnv("STRIPE_LIVE_ROOM_PRICE_ID");
  const price = await stripe.prices.retrieve(priceId);
  if (!price.active || price.livemode !== liveRoomIsLive() || objectId(price.product) !== product.id ||
    price.currency !== "usd" || !price.unit_amount || price.recurring?.interval !== "month" ||
    price.recurring.interval_count !== 1 || price.recurring.usage_type !== "licensed") {
    throw new Error("LIVE_ROOM_PRICE_UNAVAILABLE");
  }
  return price;
}

async function locked<T>(profileId: string, operation: (row: LiveRoomAccountRow, token: string) => Promise<T>) {
  const mode = liveRoomIsLive();
  const token = randomUUID();
  await repository.claim(profileId, mode, token);
  try {
    const row = await repository.get(profileId, mode);
    if (!row) throw new Error("LIVE_ROOM_STORAGE_ERROR");
    return await operation(row, token);
  } finally {
    await repository.release(profileId, mode, token);
  }
}

function assertSubscription(subscription: Stripe.Subscription, row: LiveRoomAccountRow) {
  if (subscription.livemode !== row.livemode || subscription.metadata.app_product !== "live-room" ||
    subscription.metadata.profile_id !== row.profile_id || objectId(subscription.customer) !== row.stripe_customer_id ||
    subscription.items.data.length !== 1 || objectId(subscription.items.data[0].price.product) !== liveRoomEnv("STRIPE_LIVE_ROOM_PRODUCT_ID")) {
    throw new Error("LIVE_ROOM_SUBSCRIPTION_MISMATCH");
  }
}

async function syncLocked(row: LiveRoomAccountRow, token: string, subscriptionId?: string) {
  const stripe = getLiveRoomStripe();
  let subscription: Stripe.Subscription | null = null;
  const id = subscriptionId ?? row.stripe_subscription_id;
  if (id) {
    subscription = await stripe.subscriptions.retrieve(id, { expand: ["latest_invoice"] });
    assertSubscription(subscription, row);
  }
  const invoice = subscription?.latest_invoice;
  const invoicePaid = invoice && typeof invoice !== "string" && invoice.status === "paid";
  const paidThrough = subscription?.items.data[0]?.current_period_end;
  const hasAccess = subscription?.status === "active" && Boolean(invoicePaid) && Boolean(paidThrough && paidThrough * 1000 > Date.now());
  await repository.update(row.profile_id, row.livemode, token, {
    stripe_subscription_id: subscription?.id ?? null,
    subscription_status: subscription?.status ?? "none",
    paid_through: hasAccess && paidThrough ? new Date(paidThrough * 1000).toISOString() : null,
    cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
    needs_sync: true,
  });
  if (row.discord_user_id) await discord.setRole(row.discord_user_id, hasAccess);
  return repository.update(row.profile_id, row.livemode, token, {
    role_synced: hasAccess && Boolean(row.discord_user_id), needs_sync: false,
  });
}

const cachedOffer = unstable_cache(async (): Promise<LiveRoomOffer> => {
  const price = await currentPrice();
  let description: string = liveRoom.description;
  try {
    description = await repository.getDescription() ?? description;
  } catch (error) {
    if (!(error instanceof Error && error.message === "LIVE_ROOM_SCHEMA_PENDING")) throw error;
  }
  return { amountUsd: price.unit_amount! / 100, description, configured: true };
}, ["live-room-offer"], { revalidate: 60, tags: ["live-room-offer"] });

export const LiveRoomService = {
  canEnter(account: LiveRoomAccountRow | null) {
    return Boolean(account?.subscription_status === "active" && account.role_synced && account.paid_through && new Date(account.paid_through).getTime() > Date.now());
  },
  async getOffer(): Promise<LiveRoomOffer> {
    try { return await cachedOffer(); } catch {
      // Keep the public preview readable while credentials/schema are being prepared.
      return { amountUsd: liveRoom.monthlyAmountUsd, description: liveRoom.description, configured: false };
    }
  },
  getAccount(profileId: string) { return repository.get(profileId, liveRoomIsLive()); },
  async linkDiscord(profileId: string, identity: { id: string; username: string; accessToken: string }) {
    return locked(profileId, async (row, token) => {
      if (row.discord_user_id && row.discord_user_id !== identity.id) throw new Error("LIVE_ROOM_DISCORD_ALREADY_LINKED");
      // Persist uniqueness first; the OAuth token is used once and never stored.
      const linked = await repository.update(profileId, row.livemode, token, { discord_user_id: identity.id, discord_name: identity.username, needs_sync: true });
      await discord.join(identity.id, identity.accessToken);
      return syncLocked(linked, token);
    });
  },
  async startCheckout(profileId: string, email: string | null) {
    return locked(profileId, async (row, token) => {
      if (!row.discord_user_id) throw new Error("LIVE_ROOM_DISCORD_REQUIRED");
      await discord.assertMember(row.discord_user_id);
      const stripe = getLiveRoomStripe();
      const price = await currentPrice();
      let customerId = row.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({ email: email ?? undefined, metadata: { app_product: "live-room", profile_id: profileId } },
          { idempotencyKey: `live-room:customer:${row.livemode}:${profileId}` });
        customerId = customer.id;
        row = await repository.update(profileId, row.livemode, token, { stripe_customer_id: customerId });
      }
      // Recover a session before creating anything; a completed session is never replaced.
      let pendingUrl: string | null = null;
      if (row.checkout_session_id) {
        const session = await stripe.checkout.sessions.retrieve(row.checkout_session_id);
        if (session.status === "complete") {
          const subId = objectId(session.subscription);
          if (subId) row = await syncLocked(row, token, subId);
        } else if (session.status === "open" && session.url) {
          pendingUrl = session.url;
        }
      }
      const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 });
      const existing = subscriptions.data.filter((sub) => sub.metadata.app_product === "live-room" && blockingStatuses.has(sub.status));
      if (existing.length) {
        await syncLocked(row, token, existing[0].id);
        return { url: `${liveRoomAppUrl()}${membershipPath}` };
      }
      if (pendingUrl) return { url: pendingUrl };
      const session = await stripe.checkout.sessions.create({
        mode: "subscription", customer: customerId,
        // Keep standard Checkout regardless of the account's Managed Payments default.
        managed_payments: { enabled: false },
        client_reference_id: profileId, line_items: [{ price: price.id, quantity: 1 }],
        metadata: { app_product: "live-room", profile_id: profileId },
        subscription_data: { metadata: { app_product: "live-room", profile_id: profileId } },
        success_url: `${liveRoomAppUrl()}${membershipPath}?checkout=success`,
        cancel_url: `${liveRoomAppUrl()}${membershipPath}?checkout=cancelled`,
      }, { idempotencyKey: `live-room:checkout-standard-v1:${row.livemode}:${profileId}:${price.id}:${row.checkout_session_id ?? "first"}` });
      if (!session.url) throw new Error("LIVE_ROOM_CHECKOUT_UNAVAILABLE");
      await repository.update(profileId, row.livemode, token, { checkout_session_id: session.id });
      return { url: session.url };
    });
  },
  async sync(profileId: string) {
    return locked(profileId, async (row, token) => {
      let subId = row.stripe_subscription_id;
      if (row.checkout_session_id) {
        const session = await getLiveRoomStripe().checkout.sessions.retrieve(row.checkout_session_id);
        if (session.status === "complete") subId = objectId(session.subscription) ?? subId;
      }
      return syncLocked(row, token, subId ?? undefined);
    });
  },
  async portal(profileId: string) {
    const row = await repository.get(profileId, liveRoomIsLive());
    if (!row?.stripe_customer_id) throw new Error("LIVE_ROOM_NO_MEMBERSHIP");
    const session = await getLiveRoomStripe().billingPortal.sessions.create({ customer: row.stripe_customer_id, return_url: `${liveRoomAppUrl()}${membershipPath}` });
    return { url: session.url };
  },
  async handleWebhook(event: Stripe.Event) {
    if (event.livemode !== liveRoomIsLive()) throw new Error("LIVE_ROOM_EVENT_MODE_MISMATCH");
    let subscriptionId: string | null = null;
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.app_product !== "live-room") return;
      subscriptionId = objectId(session.subscription);
    } else if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.metadata.app_product !== "live-room") return;
      subscriptionId = subscription.id;
    } else if (["invoice.paid", "invoice.payment_failed"].includes(event.type)) {
      const invoice = event.data.object as Stripe.Invoice;
      subscriptionId = objectId(invoice.parent?.subscription_details?.subscription ?? null);
    } else return;
    if (!subscriptionId) return;
    const sub = await getLiveRoomStripe().subscriptions.retrieve(subscriptionId);
    if (sub.metadata.app_product !== "live-room") return;
    const profileId = sub.metadata.profile_id;
    if (!uuidPattern.test(profileId ?? "")) throw new Error("LIVE_ROOM_SUBSCRIPTION_MISMATCH");
    // No event ordering assumption: re-read Stripe under the membership lease.
    await locked(profileId, async (row, token) => {
      if (row.stripe_subscription_id && row.stripe_subscription_id !== subscriptionId) {
        const current = await getLiveRoomStripe().subscriptions.retrieve(row.stripe_subscription_id);
        if (blockingStatuses.has(current.status)) return syncLocked(row, token);
      }
      return syncLocked(row, token, subscriptionId!);
    });
  },
};
