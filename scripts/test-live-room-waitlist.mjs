import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

let stored = []; let failure = null; let allowed = true;
const mocks = {
  "next/server": { NextResponse: { json: (body, options) => Response.json(body, options) } },
  "@/lib/supabase/admin": { getSupabaseAdminClient: () => ({ from: () => ({ insert: async row => { if (!failure) stored.push(row); return { error: failure }; } }) }) },
  "@/lib/security/rate-limit": { getRateLimitIdentity: () => "test", checkRateLimit: () => ({ allowed }) },
};
const context = { exports: {}, Response, URL, console: { error() {} }, require: id => { assert.ok(id in mocks, id); return mocks[id]; } };
vm.runInNewContext(ts.transpileModule(await readFile(new URL("../src/app/api/live-room/waitlist/route.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
const post = (body, origin = "https://example.test") => context.exports.POST(new Request("https://example.test/api/live-room/waitlist", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body) }));
assert.equal((await post({ email: "hello@example.test", consent: true }, "https://evil.test")).status, 403);
assert.equal((await post({ email: "bad", consent: true })).status, 400);
assert.equal((await post({ email: "hello@example.test" })).status, 400);
assert.equal(stored.length, 0);
assert.equal((await post({ email: " HELLO@example.test ", consent: true })).status, 200);
assert.equal(stored[0].email, "hello@example.test");
assert.equal(stored[0].consent_version, "opening-notice-v1");
failure = { code: "23505" };
assert.equal((await post({ email: "hello@example.test", consent: true })).status, 200);
failure = { code: "42P01", message: "private diagnostic" };
const unavailable = await post({ email: "hello@example.test", consent: true });
assert.equal(unavailable.status, 503);
assert.ok(!(await unavailable.text()).includes("private diagnostic"));
allowed = false;
assert.equal((await post({ email: "hello@example.test", consent: true })).status, 429);
const sql = await readFile(new URL("../supabase/migrations/20261031020000_live_room_waitlist.sql", import.meta.url), "utf8");
assert.match(sql, /enable row level security/);
assert.match(sql, /revoke all.*public, anon, authenticated/);
const gate = await readFile(new URL("../src/lib/services/live-room-enrollment.ts", import.meta.url), "utf8");
assert.match(gate, /liveRoomEnrollmentOpen = false/);
console.log("Waitlist: validation, consent, deduplication, privacy, rate limit and closed enrollment passed.");
