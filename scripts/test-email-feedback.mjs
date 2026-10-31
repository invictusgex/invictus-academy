import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";
async function load(path, mocks = {}, globals = {}) {
  const scope = { exports: {}, console: { error() {} }, AbortSignal, ...globals, require(id) { assert.ok(id in mocks, id); return mocks[id]; } };
  vm.runInNewContext(ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText, scope);
  return scope.exports;
}
const errors = await load("../src/lib/email/email-errors.ts");
for (const [status, body, expected] of [
  [401, {}, "authentication"],
  [400, { message: "API key is invalid test-secret" }, "authentication"],
  [403, { name: "validation_error", message: "The secret-domain.test domain is not verified" }, "sender_domain"],
  [403, { message: "You can only send testing emails to your own email address (private@example.test)" }, "test_recipient"],
  [403, { name: "restricted_api_key" }, "authentication"],
  [403, {}, "permission"], [429, {}, "rate_limit"],
  [429, { name: "daily_quota_exceeded" }, "quota"],
  [422, {}, "invalid_request"], [503, "secret provider detail", "provider_unavailable"],
]) assert.equal(errors.classifyEmailRejection(status, body), expected);
const config = { from: "test@example.test", resendApiKey: "test-secret", welcomeEnabled: true };
const mail = await load("../src/lib/email/transactional-email.service.ts", {
  "server-only": {}, "@/lib/email/email-config": { getEmailConfig: () => config }, "@/lib/email/email-errors": errors,
}, { fetch: async () => ({ ok: false, status: 403, json: async () => ({ message: "The secret-domain.test domain is not verified" }) }) });
await assert.rejects(mail.TransactionalEmailService.send({ category: "operational", to: "private@example.test", text: "test", html: "test", subject: "test" }), (error) => error.code === "sender_domain" && !error.message.includes("secret-domain"));
let authorized = true; let called = 0; let fail = true;
const actions = await load("../src/app/admin/live-room/email-actions.ts", {
  "@/app/admin/admin-auth": { requireAdminServerContext: async () => { if (!authorized) throw new Error("AUTH_REQUIRED"); } },
  "@/lib/email/email-errors": errors,
  "@/lib/services/live-room-alerts.service": { LiveRoomAlertsService: {
    sendTest: async () => { called += 1; if (fail) throw new errors.EmailDeliveryError("sender_domain", 403); return true; },
    deliverPending: async () => ({ sent: 1, failed: 1, busy: 0, error: "authentication" }),
  } },
});
const initial = { status: "idle", message: "" };
assert.equal((await actions.testLiveRoomEmail(initial)).message, errors.emailFailureMessages.sender_domain);
fail = false;
assert.equal((await actions.testLiveRoomEmail(initial)).status, "success");
assert.equal((await actions.retryLiveRoomEmails(initial)).status, "error");
authorized = false;
await assert.rejects(actions.testLiveRoomEmail(initial), /AUTH_REQUIRED/);
assert.equal(called, 2);

let hookIndex = 0; let pending = true;
const controls = await load("../src/components/admin/live-room/LiveRoomEmailControls.tsx", {
  "react/jsx-runtime": jsxRuntime,
  react: { useActionState: () => { const test = hookIndex++ % 2 === 0; return [test && !pending ? { status: "error", message: errors.emailFailureMessages.sender_domain } : initial, async () => {}, test && pending]; } },
});
const props = { ready: true, queueReady: true, testAction: async () => initial, retryAction: async () => initial };
const htmlPending = renderToStaticMarkup(React.createElement(controls.LiveRoomEmailControls, props));
assert.ok(htmlPending.includes("Enviando prueba"));
assert.equal((htmlPending.match(/disabled=""/g) ?? []).length, 2);
pending = false;
const htmlError = renderToStaticMarkup(React.createElement(controls.LiveRoomEmailControls, props));
assert.ok(htmlError.includes('role="alert"'));
assert.ok(htmlError.includes("EMAIL_FROM"));
assert.ok(!htmlError.includes("secret-domain"));
console.log("PASS: safe Resend classifications, inline errors, sending state, duplicate-click protection and admin authorization.");
