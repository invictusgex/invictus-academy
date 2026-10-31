import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
async function load(path, mocks, extra = {}) {
  const scope = { exports: {}, Date, Intl, console: { error() {} }, ...extra, require(id) { if (id.startsWith("node:")) return require(id); assert.ok(id in mocks, id); return mocks[id]; } };
  vm.runInNewContext(ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, scope);
  return scope.exports;
}
const booking = { id: "private-booking", profile_id: "private-student", slot_id: "private-slot", status: "confirmed", booked_at: "2026-10-31T15:00:00Z" };
const records = new Map(); const messages = []; let providerFails = false;
const repository = {
  getBooking: async () => booking,
  getSlot: async () => ({ starts_at: "2026-11-03T15:00:00Z", ends_at: "2026-11-03T16:00:00Z" }),
  enqueue: async (row) => { if (!records.has(row.booking_id)) records.set(row.booking_id, { ...row, status: "pending", attempts: 0 }); },
  get: async (id) => records.get(id),
  claim: async (row, token) => { const live = records.get(row.booking_id); if (live.status !== "pending" || live.lease_token) return false; live.lease_token = token; live.attempts += 1; return true; },
  finish: async (id, token, status, last_error) => { const row = records.get(id); assert.equal(row.lease_token, token); Object.assign(row, { status, last_error, lease_token: null }); },
  pending: async () => [...records.values()].filter((row) => row.status === "pending"),
};
const service = (await load("../src/lib/services/mentorship-email.service.ts", {
  "server-only": {}, "@/lib/email/email-config": { getEmailConfig: () => ({}) },
  "@/lib/email/email-errors": { emailFailureCode: () => "sender_domain" },
  "@/lib/email/email-template-utils": { escapeHtml: (value) => value },
  "@/lib/repositories/mentorship-email.repository": { MentorshipEmailRepository: repository },
  "@/lib/email/transactional-email.service": { TransactionalEmailService: { send: async (input) => { if (providerFails) throw Error("secret provider detail"); messages.push(input); return { sent: true }; } } },
}, { process: { env: { LIVE_ROOM_ALERT_EMAIL: "operator@example.test" } } })).MentorshipEmailService;
await service.notifyBooking(booking.id, "other-student");
assert.equal(records.size, 0, "Do not notify another student's booking");
await Promise.all([service.notifyBooking(booking.id, booking.profile_id), service.notifyBooking(booking.id, booking.profile_id)]);
assert.equal(messages.length, 1);
assert.equal(records.get(booking.id).status, "sent");
for (const value of [booking.id, booking.profile_id, booking.slot_id]) assert.ok(!JSON.stringify(messages[0]).includes(value));
assert.ok(messages[0].text.includes("America/Chicago"));
assert.ok(messages[0].text.includes("https://invictusgex.com/admin/mentorship"));
assert.match(messages[0].idempotencyKey, /^mentorship-[a-f0-9]{64}$/);
booking.id = "retry-booking"; providerFails = true;
assert.equal(await service.notifyBooking(booking.id, booking.profile_id), "pending");
assert.equal(records.get(booking.id).last_error, "sender_domain");
providerFails = false;
assert.equal((await service.retryPending()).sent, 1);
booking.id = "cancelled-booking"; providerFails = true;
await service.notifyBooking(booking.id, booking.profile_id);
booking.status = "cancelled"; providerFails = false;
assert.equal((await service.retryPending()).skipped, 1);

let background; let bookFails = false; let backgroundFails = false;
const route = await load("../src/app/api/academy/mentorship-scheduling/route.ts", {
  "next/server": { NextResponse: Response, after: (callback) => { if (backgroundFails) throw Error("unavailable"); background = callback; } },
  "@/lib/auth/server-errors": { SERVER_AUTH_ERROR_CODES: {}, ServerAuthError: class extends Error {} },
  "@/lib/auth/server": { requireServerAuthContext: async () => ({ profile: { id: "student" } }) },
  "@/lib/academy-product": { academyProductSlug: "academy" },
  "@/lib/security/rate-limit": { checkRateLimit: () => ({ allowed: true }), getRateLimitIdentity: () => "fixture" },
  "@/lib/services/academy-access.service": {}, "@/lib/services/mentorship-preparation.service": {},
  "@/lib/services/mentorship-scheduling.service": { MentorshipSchedulingService: { bookSlot: async () => { if (bookFails) throw Error("SLOT_NOT_AVAILABLE"); return { id: "booking", profileId: "student" }; }, listAvailableSlots: async () => [], listStudentBookings: async () => [] } },
  "@/lib/services/mentorship-email.service": { MentorshipEmailService: { notifyBooking: async () => { throw Error("email failure"); } } },
  "@/lib/supabase/server": { createSupabaseServerClient: async () => ({}) },
}, { Response });
const request = () => new Request("https://example.test/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotId: "slot", participantTimezone: "America/Chicago" }) });
assert.equal((await route.POST(request())).status, 201);
await background();
backgroundFails = true;
assert.equal((await route.POST(request())).status, 201);
bookFails = true; background = null;
assert.notEqual((await route.POST(request())).status, 201);
assert.equal(background, null);
console.log("PASS: one notification per booking, concurrent dedup, safe payload, retry, cancellation suppression and booking isolation from mail failures.");
