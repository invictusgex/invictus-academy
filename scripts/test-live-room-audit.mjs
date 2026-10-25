import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";

async function load(path, mocks = {}) {
  const code = ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const scope = { exports: {}, Date, Buffer, require(id) { assert.ok(id in mocks, `Unexpected dependency: ${id}`); return mocks[id]; } };
  vm.runInNewContext(code, scope);
  return scope.exports;
}
const access = await load("../src/lib/services/live-room-access.ts");
const now = Date.now();
const sub = { status: "active", livemode: true, customer: "cus_test", metadata: { app_product: "live-room", profile_id: "test-user" }, latest_invoice: { status: "paid" }, items: { data: [{ current_period_end: Math.floor(now / 1000) + 3600, price: { product: "prod_test" } }] } };
assert.equal(access.hasPaidLiveRoomAccess(sub, now), true);
assert.equal(access.hasPaidLiveRoomAccess({ ...sub, cancel_at_period_end: true }, now), true);
assert.equal(access.hasPaidLiveRoomAccess({ ...sub, status: "canceled" }, now), false);
assert.equal(access.hasPaidLiveRoomAccess({ ...sub, status: "past_due" }, now), false);
assert.equal(access.hasPaidLiveRoomAccess({ ...sub, latest_invoice: { status: "open" } }, now), false);
assert.equal(access.hasPaidLiveRoomAccess({ ...sub, latest_invoice: "in_not_expanded" }, now), false);
assert.equal(access.hasPaidLiveRoomAccess(sub, now + 7200000), false);
assert.equal(access.compareLiveRoomRole(null, true), "unknown");
assert.equal(access.compareLiveRoomRole(true, null), "unknown");
assert.equal(access.compareLiveRoomRole(false, true), "unexpected_role");
assert.equal(access.compareLiveRoomRole(true, false), "missing_role");
assert.equal(access.compareLiveRoomRole(false, false), "correct");
let current = sub; let member = { inServer: true, hasRole: true }; let stripeFailure = false; let discordFailure = false;
const account = { profile_id: "test-user", livemode: true, stripe_customer_id: "cus_test", stripe_subscription_id: "sub_test", discord_user_id: "123" };
const repository = { listForAdmin: async () => ({ accounts: [account], profiles: [], total: 1 }), findLinkedDiscordIds: async () => new Set(["123"]) };
const audit = await load("../src/lib/services/live-room-audit.service.ts", {
  "server-only": {},
  "@/lib/services/live-room-access": access,
  "@/lib/repositories/live-room.repository": { LiveRoomRepository: repository },
  "@/lib/services/discord-membership.service": { DiscordMembershipService: {
    inspectMember: async () => { if (discordFailure) throw new Error("private provider detail"); return member; },
    listRoleMembers: async () => ({ complete: true, holders: [{ id: "123", name: "linked" }, { id: "456", name: "unlinked" }] }),
  } },
  "@/lib/services/live-room-config": { liveRoomIsLive: () => true, liveRoomEnv: () => "prod_test", getLiveRoomStripe: () => ({ subscriptions: { retrieve: async () => { if (stripeFailure) throw new Error("secret detail"); return current; } } }) },
});
assert.equal((await audit.auditLiveRoomAccount(account)).result, "correct");
member = { inServer: true, hasRole: false };
assert.equal((await audit.auditLiveRoomAccount(account)).result, "missing_role");
current = { ...sub, status: "canceled" }; member.hasRole = true;
assert.equal((await audit.auditLiveRoomAccount(account)).result, "unexpected_role");
member.hasRole = false;
assert.equal((await audit.auditLiveRoomAccount(account)).result, "correct");
stripeFailure = true;
assert.equal((await audit.auditLiveRoomAccount(account)).result, "unknown");
stripeFailure = false; discordFailure = true;
assert.equal((await audit.auditLiveRoomAccount(account)).result, "unknown");
discordFailure = false; current = { ...sub, metadata: { ...sub.metadata, profile_id: "other" } };
assert.equal((await audit.auditLiveRoomAccount(account)).expected, null);
current = sub;
const report = await audit.getLiveRoomAudit(1);
assert.equal(report.inventory.unlinked.length, 1);
assert.equal(report.inventory.unlinked[0].id, "456");
const { buildLiveRoomCalendar } = await load("../src/lib/services/live-room-calendar.ts");
const calendar = buildLiveRoomCalendar("test-user", "Name, test;\nBEGIN:EVIL", "2026-11-25T20:10:49Z", false, new Date("2026-10-25T00:00:00Z"));
assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 2);
assert.ok(calendar.includes("DTSTART:20261125T201049Z"));
assert.ok(calendar.includes("DTSTART:20261126T201049Z"));
assert.ok(calendar.includes("TRIGGER:PT0S"));
assert.ok(!calendar.includes("\r\nBEGIN:EVIL"));
assert.ok(calendar.split("\r\n").every((line) => Buffer.byteLength(line) <= 75));
assert.throws(() => buildLiveRoomCalendar("id", "test", "invalid", false));
const uiScope = { exports: {}, Date, Intl, Map, require(id) {
  if (id === "react/jsx-runtime") return jsxRuntime;
  assert.equal(id, "next/link");
  return { default: (props) => { const htmlProps = { ...props }; delete htmlProps.prefetch; return React.createElement("a", htmlProps); } };
} };
vm.runInNewContext(ts.transpileModule(await readFile(new URL("../src/components/admin/live-room/LiveRoomAccessAudit.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText, uiScope);
const html = renderToStaticMarkup(React.createElement(uiScope.exports.LiveRoomAccessAudit, { audit: report, page: 1, filter: "all", syncAccount: async () => {}, refreshAudit: async () => {} }));
assert.ok(html.includes("Control de membresías"));
assert.ok(html.includes("Recordatorios de calendario"));
assert.ok(html.includes("Sincronizar"));
assert.ok(html.includes("Debería tener rol"));
assert.ok(!html.includes("secret detail"));
console.log("PASS: paid entitlement, role discrepancies, provider failures, account isolation, unlinked roles and two dated calendar reminders.");
