import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const recipient = "111111111111111111";
const channel = "222222222222222222";
const env = { DISCORD_BOT_TOKEN: "test-only" };
const purchase = { status: "pending", enrollmentId: "test", purchaseNumber: "ITA-000001", amountTotalMinor: 24900, currency: "USD" };
const calls = [];
let dmRecipient = recipient;
const mocks = {
  "server-only": {},
  "@/lib/supabase/admin": { getSupabaseAdminClient: () => ({}) },
  "@/lib/services/purchase.service": { PurchaseService: { getById: async () => purchase } },
  "@/lib/repositories/profile.repository": { ProfileRepository: { getById: async () => ({ email: "buyer@example.test" }) } },
};
const scope = { exports: {}, require: id => mocks[id], process: { env }, AbortSignal,
  fetch: async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ id: channel, type: 1, recipients: [{ id: dmRecipient }] }) };
  },
};
const file = await readFile(new URL("../src/lib/services/purchase-discord-alert.service.ts", import.meta.url), "utf8");
vm.runInNewContext(ts.transpileModule(file, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, scope);
const send = () => scope.exports.sendPurchaseDiscordAlert("test");
await send();
env.ACADEMY_DISCORD_ALERT_USER_ID = recipient;
await send();
assert.equal(calls.length, 0);
purchase.status = "paid";
await send();
assert.equal(calls.length, 2);
assert.equal(calls[0].url, "https://discord.com/api/v10/users/@me/channels");
assert.equal(calls[0].body.recipient_id, recipient);
assert.equal(calls[1].url, `https://discord.com/api/v10/channels/${channel}/messages`);
assert.match(calls[1].body.content, /buyer@example\.test/);
assert.deepEqual(calls[1].body.allowed_mentions.parse, []);
assert.equal(calls[1].body.enforce_nonce, true);
dmRecipient = channel;
await assert.rejects(send(), /DISCORD_DM_INVALID/);
assert.equal(calls.length, 3);
console.log("Purchase Discord alert: recipient, unpaid guard, private payload and mentions passed.");
