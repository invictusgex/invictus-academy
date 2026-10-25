import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { getEmailConfig } from "@/lib/email/email-config";
import { escapeHtml } from "@/lib/email/email-template-utils";
import { TransactionalEmailService } from "@/lib/email/transactional-email.service";
import { LiveRoomAlertRepository as deliveries } from "@/lib/repositories/live-room-alert.repository";
import { LiveRoomRepository } from "@/lib/repositories/live-room.repository";
import { getLiveRoomStripe, liveRoomIsLive } from "@/lib/services/live-room-config";

export const liveRoomAlertLabels: Record<string, string> = {
  renewal_upcoming: "Próxima renovación de la sala", invoice_ready: "Factura emitida: comprobar cobro",
  paid: "Pago de la sala confirmado", payment_failed: "Alerta: pago fallido", subscription_ended: "Suscripción finalizada: revisar retirada del rol",
  subscription_changed: "Cambio de suscripción", sync_failed: "Alerta: sincronización de acceso pendiente",
  access_mismatch: "Alerta: discrepancia entre pago y rol de Discord", verification_failed: "Alerta: no se pudo verificar un acceso",
};
const eventKinds: Record<string, string> = {
  "invoice.upcoming": "renewal_upcoming", "invoice.finalized": "invoice_ready", "invoice.paid": "paid", "invoice.payment_failed": "payment_failed",
  "customer.subscription.deleted": "subscription_ended", "customer.subscription.updated": "subscription_changed",
};
export function getLiveRoomAlertConfig() {
  const to = process.env.LIVE_ROOM_ALERT_EMAIL?.trim() ?? "";
  return { to: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) ? to : null, providerReady: Boolean(getEmailConfig()) };
}
function key(seed: string) { return createHash("sha256").update(seed).digest("hex"); }
async function queue(seed: string, kind: string, occurredAt: string, livemode: boolean) {
  const config = getLiveRoomAlertConfig();
  if (!config.to) return;
  await deliveries.enqueue({ id: key(`${config.to}:${seed}`), kind, occurred_at: occurredAt, livemode });
}
async function sendMinimal(kind: string, occurredAt: string, id?: string) {
  const config = getLiveRoomAlertConfig();
  if (!config.to || !config.providerReady) return false;
  const label = liveRoomAlertLabels[kind] ?? "Prueba de avisos de la sala";
  const text = `${label}\nFecha (UTC): ${occurredAt}\n\nRevisa el estado actual de los pagos y el rol real de Discord en el panel privado:\nhttps://invictusgex.com/admin/live-room\n\nEste aviso no confirma el acceso de ninguna persona. Una factura emitida no equivale a un pago realizado. Comprueba el panel antes de actuar.`;
  const result = await TransactionalEmailService.send({ category: "operational", to: config.to, subject: `[Invictus GEX] ${label}`, text,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;white-space:pre-wrap">${escapeHtml(text)}</div>`, idempotencyKey: id ? `live-room-${id}` : undefined });
  return result.sent;
}
export const LiveRoomAlertsService = {
  async sendTest() { return sendMinimal("test", new Date().toISOString()); },
  async captureEvent(event: Stripe.Event, syncFailed = false) {
    if ((!eventKinds[event.type] && !syncFailed) || !getLiveRoomAlertConfig().to || event.livemode !== liveRoomIsLive()) return;
    let subscriptionId: string | null = null;
    if (event.type.startsWith("invoice.")) {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = invoice.parent?.subscription_details?.subscription;
      subscriptionId = typeof sub === "string" ? sub : sub?.id ?? null;
    } else if (event.type.startsWith("customer.subscription.")) {
      const sub = event.data.object as Stripe.Subscription;
      subscriptionId = sub.id;
      if (!syncFailed && event.type === "customer.subscription.updated") {
        const changes = event.data.previous_attributes as Record<string, unknown> | undefined;
        if (!changes || !["status", "cancel_at", "cancel_at_period_end"].some((name) => name in changes)) return;
      }
    } else if (event.type.startsWith("checkout.session.")) {
      const sub = (event.data.object as Stripe.Checkout.Session).subscription;
      subscriptionId = typeof sub === "string" ? sub : sub?.id ?? null;
    }
    if (!subscriptionId) return;
    const sub = await getLiveRoomStripe().subscriptions.retrieve(subscriptionId, {}, { timeout: 4000, maxNetworkRetries: 0 });
    if (sub.livemode !== event.livemode || sub.metadata.app_product !== "live-room") return;
    const profileId = sub.metadata.profile_id;
    if (!/^[0-9a-f-]{36}$/i.test(profileId ?? "")) throw new Error("LIVE_ROOM_ALERT_SCOPE_MISMATCH");
    const row = await LiveRoomRepository.get(profileId, event.livemode);
    const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    if (!row || row.stripe_customer_id !== customer) throw new Error("LIVE_ROOM_ALERT_SCOPE_MISMATCH");
    await queue(`${event.id}:${syncFailed ? "sync_failed" : "billing"}`, syncFailed ? "sync_failed" : eventKinds[event.type], new Date(event.created * 1000).toISOString(), event.livemode);
  },
  async captureAudit(mismatch: boolean, unknown: boolean) {
    const now = new Date();
    const bucket = now.toISOString().slice(0, 13);
    const mode = liveRoomIsLive();
    if (mismatch) await queue(`audit:${mode}:${bucket}:mismatch`, "access_mismatch", now.toISOString(), mode);
    if (unknown) await queue(`audit:${mode}:${bucket}:unknown`, "verification_failed", now.toISOString(), mode);
  },
  async deliverPending() {
    const config = getLiveRoomAlertConfig();
    if (!config.to || !config.providerReady) return;
    for (const row of await deliveries.pending(liveRoomIsLive())) {
      const token = randomUUID();
      if (!await deliveries.claim(row, token)) continue;
      let sent = false;
      try { sent = await sendMinimal(row.kind, row.occurred_at, row.id); }
      catch { /* Keep the notice pending; never serialize provider errors. */ }
      await deliveries.finish(row.id, token, sent);
    }
  },
};
