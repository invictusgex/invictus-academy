import { spawn, spawnSync } from "node:child_process";
import { readFile, writeFile, rename } from "node:fs/promises";

const key = process.env.STRIPE_LIVE_ROOM_SECRET_KEY?.trim();
if (!key || !/^(sk|rk)_test_/.test(key)) {
  throw new Error("Este listener solo admite la clave Stripe de prueba de la sala.");
}
const env = { ...process.env, STRIPE_API_KEY: key };
const result = spawnSync("stripe", ["listen", "--print-secret", "--skip-update"], {
  env, shell: false, encoding: "utf8", timeout: 30_000, windowsHide: true,
});
const secret = result.status === 0 ? result.stdout.match(/\bwhsec_[A-Za-z0-9]+\b/)?.[0] : null;
if (!secret) throw new Error("No se pudo obtener la firma del webhook de prueba. Revisa la conexión y los permisos de Stripe CLI.");

// Generated credential: keep it in the ignored local environment, never in output.
const envPath = ".env.local";
const current = await readFile(envPath, "utf8");
const matches = current.match(/^STRIPE_LIVE_ROOM_WEBHOOK_SECRET=.*$/gm) ?? [];
if (matches.length !== 1) throw new Error("Debe existir una única variable STRIPE_LIVE_ROOM_WEBHOOK_SECRET en .env.local.");
const updated = current.replace(/^STRIPE_LIVE_ROOM_WEBHOOK_SECRET=.*$/m, `STRIPE_LIVE_ROOM_WEBHOOK_SECRET=${secret}`);
await writeFile(`${envPath}.webhook.tmp`, updated, "utf8");
await rename(`${envPath}.webhook.tmp`, envPath);
console.log("Firma de prueba guardada en .env.local (valor oculto).");

const events = [
  "checkout.session.completed", "checkout.session.async_payment_succeeded",
  "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted",
  "invoice.paid", "invoice.payment_failed",
].join(",");
const listener = spawn("stripe", ["listen", "--events", events, "--forward-to", "http://localhost:3000/api/live-room/webhook", "--skip-update", "--color", "off"], {
  env, shell: false, stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
});
function safeOutput(stream) {
  let pending = "";
  stream.on("data", (chunk) => {
    pending += chunk.toString();
    const lines = pending.split(/\r?\n|\r/);
    pending = lines.pop() ?? "";
    for (const line of lines) console.log(line.replace(/\b(?:whsec|sk_test|rk_test)_[A-Za-z0-9]+\b/g, "[oculto]"));
  });
}
safeOutput(listener.stdout);
safeOutput(listener.stderr);
listener.on("error", () => { console.error("No se pudo iniciar Stripe CLI."); process.exitCode = 1; });
listener.on("exit", (code) => { process.exitCode = code ?? 1; });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => { listener.kill(); });
