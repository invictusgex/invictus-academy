import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

async function load(path, mocks = {}, extra = {}) {
  const scope = { exports: {}, Date, Intl, ...extra, require(id) { assert.ok(id in mocks, id); return mocks[id]; } };
  vm.runInNewContext(ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, scope);
  return scope.exports;
}
const fixedNow = "2026-11-19T18:00:00Z";
class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : [fixedNow])); } static now() { return new Date(fixedNow).getTime(); } }
const window = await load("../src/lib/services/mentorship-booking-window.ts", {}, { Date: FixedDate });
const allowed = (slot, now) => window.isMentorshipBookingDateAllowed(slot, new Date(now));
const cases = [
  ["2026-11-19T23:59:00-06:00", "2026-11-19T12:00:00-06:00", false],
  ["2026-11-20T00:00:00-06:00", "2026-11-19T23:59:59-06:00", true],
  ["2026-11-20T05:59:59Z", "2026-11-19T18:00:00Z", false],
  ["2026-11-20T06:00:00Z", "2026-11-19T18:00:00Z", true],
  ["2026-03-09T00:00:00-05:00", "2026-03-08T00:01:00-06:00", true],
  ["2026-11-01T23:59:00-06:00", "2026-11-01T00:01:00-05:00", false],
  ["2027-01-01T00:00:00-06:00", "2026-12-31T23:59:00-06:00", true],
  ["2026-11-18T18:00:00Z", fixedNow, false],
  ["invalid", fixedNow, false],
];
for (const [slot, now, expected] of cases) assert.equal(allowed(slot, now), expected, `${slot} at ${now}`);
let slot = { id: "slot", status: "available", startsAt: "2026-11-19T23:00:00Z", endsAt: "2026-11-20T00:00:00Z" };
let booked = 0;
const repo = {
  listAvailableFutureSlots: async () => [slot], listActiveBlockedWindowsBetween: async () => [],
  getSlotById: async () => slot, bookSlot: async () => { booked++; return { id: "booking" }; },
};
const service = (await load("../src/lib/services/mentorship-scheduling.service.ts", { "server-only": {},
  "@/lib/services/mentorship-booking-window": window,
  "@/lib/repositories/mentorship-scheduling.repository": { MentorshipSchedulingRepository: repo },
}, { Date: FixedDate })).MentorshipSchedulingService;
assert.equal((await service.listAvailableSlots()).length, 0);
await assert.rejects(service.bookSlot({ slotId: "slot", participantTimezone: "Pacific/Auckland" }), /MENTORSHIP_NEXT_DAY_REQUIRED/);
assert.equal(booked, 0, "Changing participant timezone must not bypass the mentor's day boundary");
slot = { ...slot, startsAt: "2026-11-20T06:00:00Z", endsAt: "2026-11-20T07:00:00Z" };
assert.equal((await service.listAvailableSlots()).length, 1);
await service.bookSlot({ slotId: "slot", participantTimezone: "Europe/Madrid" });
assert.equal(booked, 1);
const sql = await readFile(new URL("../supabase/migrations/20261119020000_mentorship_next_day_booking.sql", import.meta.url), "utf8");
assert.match(sql, /before insert or update of status, slot_id/);
assert.match(sql, /security definer set search_path = ''/);
assert.match(sql, /MENTORSHIP_NEXT_DAY_REQUIRED/);
console.log("PASS: same-day blocking, tomorrow midnight, Chicago vs UTC, DST, year rollover, stale request and timezone bypass.");
