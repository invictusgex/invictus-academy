import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
async function load(path, mocks = {}, extra = {}) {
  const code = ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const scope = { exports: {}, Date, Buffer, AbortSignal, console, require(id) { if (id in mocks) return mocks[id]; if (id.startsWith("node:")) return require(id); throw new Error(`Unexpected dependency ${id}`); }, ...extra };
  vm.runInNewContext(code, scope); return scope.exports;
}
const sent = []; let providerFails = false;
const config = { provider: "resend", from: "alerts@example.test", resendApiKey: "test-secret", welcomeEnabled: false };
const email = await load("../src/lib/email/transactional-email.service.ts", {
  "server-only": {}, "@/lib/email/email-config": { getEmailConfig: () => config },
}, { fetch: async (_url, options) => { if (providerFails) throw new Error("secret provider detail"); sent.push({ payload: JSON.parse(options.body), headers: options.headers }); return { ok: true }; } });
assert.equal((await email.TransactionalEmailService.send({ to: "operator@example.test", html: "x", text: "x", subject: "x" })).sent, false, "Welcome toggle still applies to welcome mail");
const rows = new Map();
const deliveries = {
  async enqueue(row) { if (!rows.has(row.id)) rows.set(row.id, { ...row, sent_at: null, attempts: 0, lease_token: null }); },
  async pending() { return [...rows.values()].filter((row) => !row.sent_at).slice(0, 3).map((row) => ({ ...row })); },
  async claim(row, token) { const live = rows.get(row.id); if (live.sent_at || live.lease_token) return false; live.lease_token = token; live.attempts += 1; return true; },
  async finish(id, token, success) { const row = rows.get(id); assert.equal(row.lease_token, token); row.lease_token = null; row.sent_at = success ? "sent" : null; row.last_failed = !success; },
};
const profile = "11111111-1111-4111-8111-111111111111";
const subscription = { id: "sub_private", livemode: true, customer: "cus_private", metadata: { app_product: "live-room", profile_id: profile } };
const alerts = await load("../src/lib/services/live-room-alerts.service.ts", {
  "server-only": {}, "@/lib/email/email-config": { getEmailConfig: () => config },
  "@/lib/email/email-template-utils": { escapeHtml: (value) => value.replaceAll("<", "&lt;") },
  "@/lib/email/transactional-email.service": email,
  "@/lib/repositories/live-room-alert.repository": { LiveRoomAlertRepository: deliveries },
  "@/lib/repositories/live-room.repository": { LiveRoomRepository: { get: async () => ({ stripe_customer_id: "cus_private" }) } },
  "@/lib/services/live-room-config": { liveRoomIsLive: () => true, getLiveRoomStripe: () => ({ subscriptions: { retrieve: async () => subscription } }) },
}, { process: { env: { LIVE_ROOM_ALERT_EMAIL: "operator@example.test" } } });
const event = { id: "evt_private", type: "invoice.paid", livemode: true, created: 1792958400, data: { object: { parent: { subscription_details: { subscription: "sub_private" } } } } };
await alerts.LiveRoomAlertsService.captureEvent(event);
await alerts.LiveRoomAlertsService.captureEvent(event);
assert.equal(rows.size, 1);
await Promise.all([alerts.LiveRoomAlertsService.deliverPending(), alerts.LiveRoomAlertsService.deliverPending()]);
assert.equal(sent.length, 1);
assert.equal(sent[0].payload.to[0], "operator@example.test");
assert.match(sent[0].headers["Idempotency-Key"], /^live-room-[a-f0-9]{64}$/);
const serialized = JSON.stringify(sent[0]);
for (const forbidden of [profile, "sub_private", "cus_private", "evt_private"]) assert.ok(!serialized.includes(forbidden), "Email must not contain customer identifiers");
assert.ok(sent[0].payload.text.includes("https://invictusgex.com/admin/live-room"));
await alerts.LiveRoomAlertsService.captureEvent({ ...event, id: "evt_failed", type: "invoice.payment_failed" });
providerFails = true;
await alerts.LiveRoomAlertsService.deliverPending();
assert.equal([...rows.values()].filter((row) => row.last_failed).length, 1);
providerFails = false;
await alerts.LiveRoomAlertsService.deliverPending();
assert.equal([...rows.values()].filter((row) => !row.sent_at).length, 0);
await alerts.LiveRoomAlertsService.captureAudit(true, true);
await alerts.LiveRoomAlertsService.captureAudit(true, true);
assert.equal(rows.size, 4, "Manual audit deduplicates each kind within the hour");

// A mail failure (including registration failure) can never alter Stripe's acknowledgement.
let background; let syncFails = false; let registrationFails = false;
const route = await load("../src/app/api/live-room/webhook/route.ts", {
  "next/server": { NextResponse: Response, after: (callback) => { if (registrationFails) throw new Error("unavailable"); background = callback; } },
  "@/lib/services/live-room-config": { liveRoomEnv: () => "test-webhook-secret", getLiveRoomStripe: () => ({ webhooks: { constructEvent: () => event } }) },
  "@/lib/services/live-room.service": { LiveRoomService: { handleWebhook: async () => { if (syncFails) throw new Error("sync failure"); } } },
  "@/lib/services/live-room-alerts.service": { LiveRoomAlertsService: { captureEvent: async () => { throw new Error("email storage failure"); }, deliverPending: async () => {} } },
}, { Response, console: { error() {} } });
const request = () => new Request("https://example.test/webhook", { method: "POST", headers: { "stripe-signature": "test" }, body: "{}" });
assert.equal((await route.POST(request())).status, 200);
await background();
syncFails = true;
assert.equal((await route.POST(request())).status, 500);
syncFails = false; registrationFails = true;
assert.equal((await route.POST(request())).status, 200);
assert.equal((await route.POST(new Request("https://example.test/webhook", { method: "POST" }))).status, 400);
console.log("PASS: minimal payload, private recipient, independent welcome toggle, duplicate/concurrent delivery, retry, and billing response isolation.");
