import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
async function load(path, mocks, extra = {}) {
  const scope = { exports: {}, Date, Intl, AbortSignal, console: { error() {} }, ...extra, require(id) { if (id.startsWith("node:")) return require(id); assert.ok(id in mocks, id); return mocks[id]; } };
  vm.runInNewContext(ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, scope);
  return scope.exports;
}
const booking = { id: "fixture-booking", profile_id: "fixture-student", slot_id: "fixture-slot", status: "confirmed", booked_at: "2026-11-19T15:00:00Z", participant_timezone: "Europe/Madrid", participant_note: "Preguntas sobre contexto" };
const slot = { starts_at: "2026-11-24T16:00:00Z", ends_at: "2026-11-24T17:00:00Z", timezone: "America/Chicago" };
const db = { from(name) { return { select() { return this; }, eq() { return this; }, async maybeSingle() { return { data: booking }; }, async single() { return { data: name === "profiles" ? { full_name: "Alumno de prueba", email: "alumno@example.test" } : slot }; } }; } };
const notice = await load("../src/lib/services/mentorship-notice.ts", { "server-only": {}, "@/lib/supabase/admin": { getSupabaseAdminClient: () => db } });
const content = await notice.getMentorshipNotice(booking.id);
for (const value of ["Alumno de prueba", "alumno@example.test", "60 minutos", "Europe/Madrid", "America/Chicago", "Preguntas sobre contexto"]) assert.ok(content.text.includes(value), value);
assert.ok(content.text.length < 2000);
booking.status = "cancelled";
assert.equal(await notice.getMentorshipNotice(booking.id), null);
booking.status = "confirmed";
const records = new Map(); const messages = []; let blocked = false; let wrongRecipient = false;
const repository = {
  getBooking: async () => booking, getSlot: async () => slot,
  enqueue: async row => { if (!records.has(row.booking_id)) records.set(row.booking_id, { ...row, status: "pending", attempts: 0 }); },
  get: async id => records.get(id), pending: async () => [...records.values()].filter(r => r.status === "pending"),
  claim: async (row, token) => { if (row.status !== "pending" || row.token) return false; row.token = token; row.attempts++; return true; },
  finish: async (id, token, status, code) => { const row = records.get(id); assert.equal(row.token, token); Object.assign(row, { token: null, status, last_error: code }); },
};
const env = { ACADEMY_DISCORD_ALERT_USER_ID: "111111111111111111", DISCORD_BOT_TOKEN: "fixture-only" };
const service = await load("../src/lib/services/mentorship-discord.service.ts", {
  "server-only": {}, "@/lib/repositories/mentorship-email.repository": { MentorshipDiscordRepository: repository }, "@/lib/services/mentorship-notice": notice,
}, { process: { env }, fetch: async (url, options) => {
  if (url.endsWith("/users/@me/channels")) return { ok: true, json: async () => ({ id: "222222222222222222", type: 1, recipients: [{ id: wrongRecipient ? "333333333333333333" : env.ACADEMY_DISCORD_ALERT_USER_ID }] }) };
  if (blocked) return { ok: false, status: 403 };
  messages.push(JSON.parse(options.body)); return { ok: true };
} });
await service.MentorshipDiscordService.notifyBooking(booking.id, "wrong");
assert.equal(records.size, 0);
await Promise.all([service.MentorshipDiscordService.notifyBooking(booking.id, booking.profile_id), service.MentorshipDiscordService.notifyBooking(booking.id, booking.profile_id)]);
assert.equal(messages.length, 1);
assert.equal(records.get(booking.id).status, "sent");
assert.equal(messages[0].allowed_mentions.parse.length, 0);
await service.MentorshipDiscordService.notifyBooking(booking.id, booking.profile_id);
assert.equal(messages.length, 1);
booking.id = "retry"; blocked = true;
await service.MentorshipDiscordService.notifyBooking(booking.id, booking.profile_id);
assert.equal(records.get(booking.id).last_error, "discord_dm_blocked");
blocked = false;
assert.equal((await service.MentorshipDiscordService.retryPending()).sent, 1);
booking.id = "cancel-before-retry"; blocked = true;
await service.MentorshipDiscordService.notifyBooking(booking.id, booking.profile_id);
booking.status = "cancelled"; blocked = false;
assert.equal((await service.MentorshipDiscordService.retryPending()).skipped, 1);
wrongRecipient = true;
await assert.rejects(service.sendMentorshipDiscordMessage("fixture", "key"), /discord_unavailable/);
console.log("PASS: booking details, timezone, private recipient, persistent dedup, concurrency, retry and cancellation.");
