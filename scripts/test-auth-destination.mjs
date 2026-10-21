import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

async function load(path, mocks = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, URL, require: (id) => {
    assert.ok(id in mocks, `Unexpected dependency: ${id}`);
    return mocks[id];
  } };
  vm.runInNewContext(code, context);
  return context.exports;
}

const redirects = await load("../src/lib/auth/redirects.ts");
assert.equal(redirects.getSafeInternalRedirect(null), "/auth/continue");
assert.equal(redirects.getSafeInternalRedirect("//evil.example"), "/auth/continue");
assert.equal(redirects.getSafeInternalRedirect("https://evil.example"), "/auth/continue");
for (const path of ["/checkout/start", "/sala-en-vivo/suscripcion", "/academy/programa", "/"]) {
  assert.equal(redirects.getSafeInternalRedirect(path), path);
}
assert.equal(redirects.getSafeInternalRedirect(null, "/reset-password"), "/reset-password");
assert.equal(redirects.getSafePublicRedirect(null), "/");

let user = null;
let access = false;
let checks = 0;
const page = await load("../src/app/auth/continue/page.tsx", {
  "next/navigation": { redirect: (path) => { throw { redirect: path }; } },
  "@/lib/auth/server": { getCurrentServerUser: async () => user },
  "@/lib/supabase/server": { createSupabaseServerClient: async () => "session-client" },
  "@/lib/services/academy-access.service": { getAcademyEnrollmentAccess: async (id, client) => {
    checks += 1;
    assert.equal(id, "current-user");
    assert.equal(client, "session-client");
    return { hasAcademyProgramAccess: access };
  } },
});
await assert.rejects(page.default(), (error) => error.redirect === "/login");
assert.equal(checks, 0);
user = { id: "current-user" };
await assert.rejects(page.default(), (error) => error.redirect === "/");
access = true;
await assert.rejects(page.default(), (error) => error.redirect === "/academy");
access = false;
await assert.rejects(page.default(), (error) => error.redirect === "/");
console.log("PASS: default destination uses existing enrollment access; explicit purchase/room destinations and password recovery preserved.");
