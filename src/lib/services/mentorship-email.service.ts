import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { getEmailConfig } from "@/lib/email/email-config";
import { emailFailureCode, type EmailFailureCode } from "@/lib/email/email-errors";
import { escapeHtml } from "@/lib/email/email-template-utils";
import { TransactionalEmailService } from "@/lib/email/transactional-email.service";
import { MentorshipEmailRepository as repository } from "@/lib/repositories/mentorship-email.repository";

export function getMentorshipEmailConfig() {
  const to = (process.env.MENTORSHIP_ALERT_EMAIL || process.env.LIVE_ROOM_ALERT_EMAIL)?.trim() ?? "";
  return { to: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) ? to : null, providerReady: Boolean(getEmailConfig()) };
}

async function deliver(bookingId: string) {
  const row = await repository.get(bookingId);
  if (!row || row.status !== "pending") return "unchanged";
  const token = randomUUID();
  if (!await repository.claim(row, token)) return "unchanged";
  let result: "pending" | "sent" | "skipped" = "pending";
  let errorCode: EmailFailureCode | null = null;
  try {
    const booking = await repository.getBooking(bookingId);
    if (!booking || booking.status !== "confirmed") result = "skipped";
    else {
      const config = getMentorshipEmailConfig();
      if (!config.to || !config.providerReady) errorCode = "configuration";
      else {
        const format = (value: string) => new Intl.DateTimeFormat("es", { dateStyle: "full", timeStyle: "short", timeZone: "America/Chicago" }).format(new Date(value));
        const text = `Se ha agendado una mentoría.\n\nInicio: ${format(row.starts_at)}\nFin: ${format(row.ends_at)}\nZona horaria: America/Chicago\n\nConsulta el alumno y el estado actual de la reserva en tu agenda privada:\nhttps://invictusgex.com/admin/mentorship\n\nEste aviso no incluye nombres, correos, notas ni identificadores del alumno. Si la reserva cambia después, consulta siempre el panel.`;
        const hash = createHash("sha256").update(`${config.to}:${bookingId}`).digest("hex");
        const sent = await TransactionalEmailService.send({ category: "operational", to: config.to, subject: "[Invictus GEX] Nueva mentoría agendada", text,
          html: `<div style="font-family:Arial,sans-serif;line-height:1.6;white-space:pre-wrap">${escapeHtml(text)}</div>`, idempotencyKey: `mentorship-${hash}` });
        if (sent.sent) result = "sent";
        else errorCode = "configuration";
      }
    }
  } catch (error) { errorCode = emailFailureCode(error); }
  await repository.finish(bookingId, token, result, errorCode);
  return result;
}

export const MentorshipEmailService = {
  async notifyBooking(bookingId: string, profileId: string) {
    const booking = await repository.getBooking(bookingId);
    if (!booking || booking.status !== "confirmed" || booking.profile_id !== profileId) return;
    const slot = await repository.getSlot(booking.slot_id);
    if (!slot) throw new Error("MENTORSHIP_EMAIL_SLOT_UNAVAILABLE");
    await repository.enqueue({ booking_id: booking.id, booked_at: booking.booked_at, starts_at: slot.starts_at, ends_at: slot.ends_at });
    return deliver(booking.id);
  },
  async retryPending() {
    const result = { sent: 0, pending: 0, skipped: 0 };
    for (const row of await repository.pending()) {
      const state = await deliver(row.booking_id);
      if (state === "sent") result.sent += 1;
      else if (state === "skipped") result.skipped += 1;
      else result.pending += 1;
    }
    return result;
  },
};
