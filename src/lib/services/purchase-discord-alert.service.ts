import "server-only";

import { ProfileRepository } from "@/lib/repositories/profile.repository";
import { PurchaseService } from "@/lib/services/purchase.service";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function sendPurchaseDiscordAlert(purchaseId: string) {
  const recipient = process.env.ACADEMY_DISCORD_ALERT_USER_ID?.trim() ?? "";
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token || !/^\d{17,20}$/.test(recipient)) return;

  const supabase = getSupabaseAdminClient();
  const purchase = await PurchaseService.getById(purchaseId, supabase);
  if (!purchase || purchase.status !== "paid" || !purchase.enrollmentId) return;

  const profile = await ProfileRepository.getById(supabase, purchase.profileId);
  const email = profile?.email?.replace(/[\r\n]/g, "").slice(0, 254);
  const money = new Intl.NumberFormat("es", { style: "currency", currency: purchase.currency, currencyDisplay: "code" });
  const amount = purchase.amountTotalMinor === null ? "No disponible" : money.format(purchase.amountTotalMinor / 10 ** (money.resolvedOptions().maximumFractionDigits ?? 2));
  const headers = { Authorization: `Bot ${token}`, "Content-Type": "application/json" };
  const signal = AbortSignal.timeout(8000);
  const post = (path: string, body: object) => fetch(`https://discord.com/api/v10${path}`, { method: "POST", headers, signal, body: JSON.stringify(body), redirect: "error" });
  const dm = await post("/users/@me/channels", { recipient_id: recipient });
  if (!dm.ok) throw new Error("DISCORD_DM_UNAVAILABLE");
  const channel = await dm.json();
  if (channel.type !== 1 || typeof channel.id !== "string" || !/^\d{17,20}$/.test(channel.id) ||
    !Array.isArray(channel.recipients) || channel.recipients.length !== 1 || channel.recipients[0]?.id !== recipient) {
    throw new Error("DISCORD_DM_INVALID");
  }
  const response = await post(`/channels/${channel.id}/messages`, {
    content: `**Nueva compra · Academia Invictus GEX**\nCompra: ${purchase.purchaseNumber}\nImporte: ${amount}\nCorreo de la cuenta compradora: ${email || "No disponible"}\nPago confirmado · Acceso activado`,
    allowed_mentions: { parse: [] },
    nonce: `academy-${purchase.purchaseNumber}`,
    enforce_nonce: true,
  });
  if (!response.ok) throw new Error("DISCORD_DM_SEND_FAILED");
}
