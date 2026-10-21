import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

// Offline service tests: no credentials, database writes or provider requests.
const require = createRequire(import.meta.url);
const profileId = "11111111-1111-4111-8111-111111111111";
const records = new Map();
const sessions = new Map();
const subscriptions = new Map();
const roleChanges = [];
let failDiscord = false;
let checkoutCreates = 0;
const repository = {
  async claim(id, mode, token) {
    const row = records.get(id) ?? { profile_id: id, livemode: mode, discord_user_id: null, stripe_customer_id: null, stripe_subscription_id: null, checkout_session_id: null, subscription_status: "none", needs_sync: false, role_synced: false };
    if (row.operation_token) throw new Error("LIVE_ROOM_BUSY");
    records.set(id, { ...row, operation_token: token });
  },
  async get(id) { return records.get(id) ?? null; },
  async update(id, mode, token, patch) {
    const row = records.get(id);
    assert.equal(row.operation_token, token);
    const result = { ...row, ...patch };
    records.set(id, result);
    return result;
  },
  async release(id) { records.get(id).operation_token = null; },
  async getDescription() { return "Descripción editable"; },
};
const stripe = {
  products: { async retrieve() { return { id: "prod_room", active: true, default_price: "price_room" }; } },
  prices: { async retrieve() { return { id: "price_room", product: "prod_room", active: true, livemode: false, currency: "usd", unit_amount: 3000, recurring: { interval: "month", interval_count: 1, usage_type: "licensed" } }; } },
  customers: { async create() { return { id: "cus_room" }; } },
  checkout: { sessions: {
    async retrieve(id) { assert.ok(sessions.has(id)); return sessions.get(id); },
    async create(input) {
      assert.equal(input.mode, "subscription");
      assert.equal(input.managed_payments?.enabled, false, "Room uses standard Checkout even when the account defaults to Managed Payments");
      assert.equal(input.metadata.profile_id, profileId);
      assert.equal(input.line_items[0].price, "price_room");
      const id = `cs_${++checkoutCreates}`;
      const session = { id, status: "open", url: "https://checkout.stripe.com/test-session" };
      sessions.set(id, session);
      return session;
    },
  } },
  subscriptions: {
    async retrieve(id) { assert.ok(subscriptions.has(id)); return subscriptions.get(id); },
    async list() { return { data: [...subscriptions.values()] }; },
  },
};
const discord = {
  async join() {},
  async assertMember() {},
  async setRole(id, allowed) {
    if (failDiscord) throw new Error("LIVE_ROOM_DISCORD_UNAVAILABLE");
    roleChanges.push({ id, allowed });
  },
};
const mocks = {
  "server-only": {},
  "next/cache": { unstable_cache: (fn) => fn },
  "@/content/live-room": { liveRoom: { description: "Texto inicial", monthlyAmountUsd: 30 } },
  "@/lib/repositories/live-room.repository": { LiveRoomRepository: repository },
  "@/lib/services/discord-membership.service": { DiscordMembershipService: discord },
  "@/lib/services/live-room-config": { getLiveRoomStripe: () => stripe, liveRoomAppUrl: () => "http://localhost:3000", liveRoomEnv: () => "prod_room", liveRoomIsLive: () => false },
};
const code = ts.transpileModule(await readFile(new URL("../src/lib/services/live-room.service.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const diagnostics = [];
const testEnv = { STRIPE_LIVE_ROOM_SECRET_KEY: "test-only", STRIPE_LIVE_ROOM_PRODUCT_ID: "prod_room", STRIPE_LIVE_ROOM_PRICE_ID: "price_room" };
const context = { exports: {}, require: (id) => mocks[id] ?? require(id), Date,
  console: { ...console, error: (...args) => diagnostics.push(args.join(" ")) }, Buffer, process: { env: testEnv } };
vm.runInNewContext(code, context);
const service = context.exports.LiveRoomService;

await assert.rejects(service.startCheckout(profileId, null), /DISCORD_REQUIRED/);
await service.linkDiscord(profileId, { id: "123456789012345678", username: "participante", accessToken: "test-only" });
await service.startCheckout(profileId, null);
await service.startCheckout(profileId, null);
assert.equal(checkoutCreates, 1, "Retry reuses pending checkout");
sessions.get("cs_1").status = "expired";
await service.startCheckout(profileId, null);
assert.equal(checkoutCreates, 2, "Expired checkout can be replaced");

const sub = {
  id: "sub_room", livemode: false, customer: "cus_room", status: "active", cancel_at_period_end: false,
  metadata: { app_product: "live-room", profile_id: profileId },
  latest_invoice: { status: "paid" },
  items: { data: [{ price: { product: "prod_room" }, current_period_end: Math.floor(Date.now() / 1000) + 86400 }] },
};
subscriptions.set(sub.id, sub);
Object.assign(sessions.get("cs_2"), { status: "complete", subscription: sub.id });
await service.sync(profileId);
assert.equal(service.canEnter(records.get(profileId)), true);
await service.startCheckout(profileId, null);
assert.equal(checkoutCreates, 2, "Active membership prevents another checkout");
sub.cancel_at_period_end = true;
await service.sync(profileId);
assert.equal(service.canEnter(records.get(profileId)), true, "Cancellation at period end retains paid access");

sub.status = "past_due";
await service.sync(profileId);
assert.equal(roleChanges.at(-1).allowed, false);
assert.equal(service.canEnter(records.get(profileId)), false);
sub.status = "active";
failDiscord = true;
await assert.rejects(service.sync(profileId), /DISCORD_UNAVAILABLE/);
assert.equal(records.get(profileId).needs_sync, true, "Failed role sync remains durable and retryable");
failDiscord = false;
await service.sync(profileId);
assert.equal(records.get(profileId).needs_sync, false);
assert.equal(service.canEnter(records.get(profileId)), true);

const event = { livemode: false, type: "customer.subscription.updated", data: { object: sub } };
await service.handleWebhook(event);
await service.handleWebhook(event);
assert.equal(checkoutCreates, 2, "Replayed webhooks never create checkouts");
await assert.rejects(service.handleWebhook({ ...event, livemode: true }), /MODE_MISMATCH/);
const priorCustomer = sub.customer;
sub.customer = "cus_other";
await assert.rejects(service.sync(profileId), /SUBSCRIPTION_MISMATCH/);
sub.customer = priorCustomer;
sub.status = "canceled";
await service.handleWebhook(event);
assert.equal(roleChanges.at(-1).allowed, false);
assert.equal(service.canEnter(records.get(profileId)), false);
assert.equal((await service.getOffer()).amountUsd, 30);
assert.equal(diagnostics.length, 0, "Successful offer does not log errors");
const retrieveProduct = stripe.products.retrieve;
stripe.products.retrieve = async () => { throw {
  type: "StripeAuthenticationError", code: "invalid_api_key", statusCode: 401,
  message: "Invalid API Key provided: sk_live_DO_NOT_LOG person@example.com", headers: { authorization: "DO_NOT_LOG" }, requestId: "req_safe123",
}; };
assert.equal((await service.getOffer()).configured, false);
assert.ok(diagnostics.at(-1).includes('"stage":"stripe_product"'));
assert.ok(diagnostics.at(-1).includes('"httpStatus":401'));
assert.ok(diagnostics.at(-1).includes('"errorCode":"invalid_api_key"'));
assert.ok(diagnostics.at(-1).includes('"authReason":"invalid_key"'));
assert.ok(diagnostics.at(-1).includes('"requestId":"req_safe123"'));
assert.ok(!diagnostics.join(" ").includes("DO_NOT_LOG"));
assert.ok(!diagnostics.join(" ").includes("person@example.com"));
testEnv.STRIPE_LIVE_ROOM_SECRET_KEY = "sk_live_DO_NOT_LOG***";
stripe.products.retrieve = async () => { throw { type: "StripeAuthenticationError", statusCode: 401, message: "IP address not allowed: DO_NOT_LOG", requestId: "DO_NOT_LOG" }; };
assert.equal((await service.getOffer()).configured, false);
const safeDiagnostic = JSON.parse(diagnostics.at(-1).slice("[live-room:offer] ".length));
assert.equal(safeDiagnostic.authReason, "ip_restricted");
assert.equal(safeDiagnostic.keyDiagnostics.family, "sk_live");
assert.equal(safeDiagnostic.keyDiagnostics.containsMask, true);
assert.equal(safeDiagnostic.keyDiagnostics.formatValid, false);
assert.equal(safeDiagnostic.requestId, null);
assert.ok(!diagnostics.join(" ").includes("DO_NOT_LOG"));
testEnv.STRIPE_LIVE_ROOM_SECRET_KEY = "test-only";
stripe.products.retrieve = retrieveProduct;
const retrievePrice = stripe.prices.retrieve;
stripe.prices.retrieve = async () => ({ ...await retrievePrice(), currency: "eur" });
assert.equal((await service.getOffer()).configured, false);
assert.ok(diagnostics.at(-1).includes('"failedChecks":["currency_not_usd"]'));
stripe.prices.retrieve = retrievePrice;
const getDescription = repository.getDescription;
repository.getDescription = async () => { throw new Error("private database details DO_NOT_LOG"); };
assert.equal((await service.getOffer()).configured, false);
assert.ok(diagnostics.at(-1).includes('"stage":"description_storage"'));
assert.ok(!diagnostics.join(" ").includes("DO_NOT_LOG"));
repository.getDescription = getDescription;
assert.equal((await service.getOffer()).configured, true);
console.log("PASS: offer diagnostics identify Stripe/validation/storage failures without secrets or PII.");
console.log("PASS: pending/expired checkout, duplicate prevention, paid access, cancellation, failed payment, role retries, webhook replay and account isolation.");
