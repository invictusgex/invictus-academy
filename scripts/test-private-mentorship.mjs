import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

async function load(path, mocks, extra = {}) {
  const scope = { exports: {}, Date, URL, ...extra, require(id) { assert.ok(id in mocks, id); return mocks[id]; } };
  vm.runInNewContext(ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, scope);
  return scope.exports;
}
const errors = await load("../src/lib/stripe/stripe-errors.ts", {});
const offer = (await load("../src/content/private-mentorship.ts", {})).privateMentorship;
let amount = 34900; let pending = null; let previous = null; let created = []; let expired = [];
const stripe = {
  prices: { retrieve: async () => ({ active: true, type: "one_time", recurring: null, unit_amount: amount, currency: "usd" }) },
  checkout: { sessions: {
    retrieve: async () => previous,
    expire: async id => { expired.push(id); },
    create: async input => { created.push(input); return { id: "cs_new", url: "https://checkout.stripe.com/test", status: "open", payment_intent: null }; },
  } },
};
const purchase = { id: "purchase", purchaseNumber: "ITA-TEST", amountTotalMinor: 34900, currency: "USD" };
const purchaseService = new Proxy({}, { get: (_, name) => name === "getPendingPurchaseForProfileAndProduct" ? async () => pending : name === "createPendingPurchase" ? async () => purchase : name === "attachProviderCheckoutSession" ? async () => ({ ...purchase, providerCheckoutSessionId: "cs_new" }) : async () => purchase });
const { createCheckoutSession } = await load("../src/lib/stripe/checkout.service.ts", {
  "server-only": {}, "@/content/private-mentorship": { privateMentorship: offer },
  "@/lib/services/purchase.service": { PurchaseService: purchaseService },
  "@/lib/supabase/admin": { getSupabaseAdminClient: () => ({}) },
  "@/lib/stripe/stripe-config": { getStripeCheckoutConfig: () => ({ appUrl: "https://example.test" }) },
  "@/lib/stripe/checkout-catalog": { getCheckoutProductConfig: () => ({ priceId: "price_fixed" }) },
  "@/lib/stripe/stripe-errors": errors,
  "@/lib/stripe/stripe-server": { getStripeServer: () => stripe },
});
const input = { profileId: "student", userEmail: "student@example.test", internalProductId: "product", productSlug: "trading-basado-en-datos", environment: "production" };
await createCheckoutSession(input);
assert.equal(created[0].allow_promotion_codes, false);
assert.equal(created[0].metadata.offering, "private_mentorship_v1");
assert.match(created[0].custom_text.submit.message, /hasta dos horas cada una/);
assert.match(offer.description, /hasta dos horas/);
const presentation = await readFile(new URL("../src/components/mentorship/PrivateMentorshipPresentation.tsx", import.meta.url), "utf8");
assert.doesNotMatch(presentation, /Hasta cubrir el contenido|alcance compartido|contenido acordado|Consultar antes de comprar/i);
assert.doesNotMatch(JSON.stringify(offer), /alcance acordado|contenido acordado/i);
assert.match(presentation, /Sin un número fijo de sesiones/);
const scheduling = await readFile(new URL("../src/components/academy/mentorship/MentorshipSchedulingPanel.tsx", import.meta.url), "utf8");
assert.match(scheduling, /showModal/);
assert.match(scheduling, /Agendar mentoría/);
assert.match(scheduling, /isMentorshipBookingDateAllowed\(slot.startsAt\)/);
assert.match(scheduling, /daySlots.some/);
assert.match(scheduling, /cache: "no-store"/);
assert.doesNotMatch(await readFile(new URL("../src/app/academy/page.tsx", import.meta.url), "utf8"), /Contactar al mentor/);
amount = 69900;
await assert.rejects(createCheckoutSession(input), /349 USD/);
assert.equal(created.length, 1);
amount = 34900; pending = { ...purchase, providerCheckoutSessionId: "cs_old", createdAt: "2020-01-01" };
previous = { id: "cs_old", status: "open", url: "https://checkout.stripe.com/old", allow_promotion_codes: true, amount_subtotal: 34900, currency: "usd" };
await createCheckoutSession(input);
assert.equal(expired[0], "cs_old");
assert.equal(created.length, 2);
previous = { ...previous, allow_promotion_codes: false, metadata: { offering: "private_mentorship_v1" }, total_details: { amount_discount: 0 } };
assert.equal((await createCheckoutSession(input)).recoveredPendingSession, true);
assert.equal(created.length, 2);
previous = { ...previous, status: "complete", payment_status: "paid" };
assert.equal((await createCheckoutSession(input)).url, "https://example.test/checkout/success");
assert.equal(created.length, 2, "A paid session must never cause another charge attempt");
const sql = await readFile(new URL("../supabase/migrations/20261122010000_private_mentorship_product.sql", import.meta.url), "utf8");
assert.ok(!sql.includes("delete from"));
assert.ok(!sql.includes("v_completed_modules"));
assert.match(sql, /mentorship_booking_date_allowed/);
assert.match(sql, /set_private_mentorship_completed/);
for (const path of ["../src/app/page.tsx", "../src/app/programa/page.tsx", "../src/app/oferta/page.tsx"]) assert.match(await readFile(new URL(path, import.meta.url), "utf8"), /PrivateMentorshipPresentation/);
assert.ok(!(await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8")).includes("PublicPromoRibbon"));
console.log("PASS: fixed 349 USD, no coupons, old-session expiry, paid-session safety, recurring mentorship and archived routes.");
