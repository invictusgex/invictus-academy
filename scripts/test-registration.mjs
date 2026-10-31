import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
async function load(path, mocks = {}, globals = {}) {
  const scope = { exports: {}, console: { error() {} }, ...globals, require(id) { if (id.startsWith("node:")) return require(id); assert.ok(id in mocks, id); return mocks[id]; } };
  vm.runInNewContext(ts.transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, scope);
  return scope.exports;
}
const mapping = await load("../src/lib/auth/registration-errors.ts");
for (const [error, kind, status] of [
  [{code:"email_address_not_authorized"},"email_delivery_configuration",503],
  [{code:"over_email_send_rate_limit"},"email_rate_limit",429],
  [{code:"unexpected_failure",message:"Error sending confirmation email"},"confirmation_email_failed",503],
  [{code:"weak_password"},"weak_password",400],
  [{code:"signup_disabled"},"signup_unavailable",503],
  [{code:"captcha_failed"},"verification_failed",400],
  [{status:401,message:"secret api key"},"auth_configuration",503],
  [{code:"unexpected_failure",message:"Database error saving new user"},"account_storage_failed",503],
  [{code:"user_already_exists"},"existing_account",200],
]) { const result=mapping.classifyRegistrationError(error); assert.equal(result.kind,kind); assert.equal(result.status,status); }
const logs=[]; let providerError=null; let throwAuth=false; let profileFails=false; let limited=false; let signups=0; let profiles=0;
let identity={id:"test-user",identities:[{id:"test-identity"}]};
const admin={admin:true};
const signupClient={auth:{signUp:async(input)=>{signups+=1; assert.equal(input.email,"new@example.test"); assert.equal(input.options.emailRedirectTo,"https://example.test/auth/confirm?next=%2Fcheckout%2Fstart"); if(throwAuth)throw new Error("private upstream payload"); return {data:{user:identity,session:null},error:providerError};}}};
const route=await load("../src/app/api/auth/register/route.ts",{
  "next/server":{NextResponse:Response},
  "@/lib/auth/redirects":{getSafeInternalRedirect:(value)=>value==="/checkout/start"?value:"/auth/continue"},
  "@/lib/auth/registration-errors":mapping,
  "@/lib/supabase/registration":{createSupabaseRegistrationClient:()=>signupClient},
  "@/lib/supabase/admin":{getSupabaseAdminClient:()=>admin},
  "@/lib/repositories/profile.repository":{ProfileRepository:{upsertStudentProfile:async(client)=>{profiles+=1;assert.equal(client,admin);if(profileFails)throw Error("private DB detail");}}},
  "@/lib/security/rate-limit":{getRateLimitIdentity:()=>"fixture",checkRateLimit:()=>({allowed:!limited,retryAfterSeconds:60}),createSimpleRateLimitResponse:()=>new Response(null,{status:429})},
  "@/config/site":{getSiteUrl:()=>"https://example.test"},
},{Response,console:{error:(...values)=>logs.push(values.join(" "))}});
const input={fullName:"Test Participant",email:" New@Example.Test ",password:"fixture-password",passwordConfirmation:"fixture-password",next:"/checkout/start"};
const request=(patch={})=>new Request("https://example.test/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...input,...patch})});
assert.equal((await route.POST(request({passwordConfirmation:"different"}))).status,400); assert.equal(signups,0);
limited=true; assert.equal((await route.POST(request())).status,429); assert.equal(signups,0); limited=false;
const success=await route.POST(request()); assert.equal(success.status,200); assert.equal((await success.json()).status,"confirmation_required"); assert.equal(profiles,1);
identity={id:"fake-existing",identities:[]};
const hiddenExisting=await route.POST(request()); assert.equal(hiddenExisting.status,200); assert.equal(profiles,1);
providerError={code:"user_already_exists",message:"private email exists"};
const existing=await route.POST(request()); assert.deepEqual(await existing.json(),await hiddenExisting.json());
providerError={code:"unexpected_failure",message:"Error sending confirmation email private@example.test SMTP secret"};
const failed=await route.POST(request()); assert.equal(failed.status,503); const failure=await failed.json(); assert.equal(failure.code,"confirmation_email_failed"); assert.match(failure.requestId,/^[a-f0-9-]{36}$/);
assert.ok(!JSON.stringify(failure).includes("SMTP secret"));
throwAuth=true; assert.equal((await route.POST(request())).status,503); throwAuth=false;
providerError=null; identity={id:"test-user",identities:[{}]}; profileFails=true;
const profileFailure=await route.POST(request()); assert.equal((await profileFailure.json()).code,"profile_sync_failed");
for(const forbidden of [input.password,"private@example.test","SMTP secret","private DB detail","New@Example.Test"]) assert.ok(!logs.join(" ").includes(forbidden));
let clients=0;
const factory=await load("../src/lib/supabase/registration.ts",{
  "server-only":{},"@/lib/supabase/config":{getSupabasePublicConfig:()=>({url:"https://example.test",anonKey:"public-key"})},
  "@supabase/supabase-js":{createClient:(url,key,options)=>{assert.equal(key,"public-key");assert.equal(options.auth.persistSession,false);return {instance:++clients};}},
});
assert.notEqual(factory.createSupabaseRegistrationClient(),factory.createSupabaseRegistrationClient());
console.log("PASS: signup validation, privacy, duplicate-account ambiguity, SMTP/rate/config errors, profile failures, redirects and isolated public Auth clients.");
