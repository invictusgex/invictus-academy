import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { MentorshipDiscordRepository as repository } from "@/lib/repositories/mentorship-email.repository";
import { getMentorshipNotice } from "@/lib/services/mentorship-notice";

export function getMentorshipDiscordConfig() {
  const recipient = (process.env.MENTORSHIP_DISCORD_ALERT_USER_ID || process.env.ACADEMY_DISCORD_ALERT_USER_ID)?.trim() ?? "";
  return { recipient, ready: /^\d{17,20}$/.test(recipient) && Boolean(process.env.DISCORD_BOT_TOKEN?.trim()) };
}

export async function sendMentorshipDiscordMessage(text: string, key: string) {
  const config = getMentorshipDiscordConfig();
  if (!config.ready) throw new Error("configuration");
  const headers = { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN!.trim()}`, "Content-Type": "application/json" };
  const signal = AbortSignal.timeout(8000);
  const post = (path: string, body: object) => fetch(`https://discord.com/api/v10${path}`, { method: "POST", headers, signal, body: JSON.stringify(body), redirect: "error" });
  const response = await post("/users/@me/channels", { recipient_id: config.recipient });
  if (!response.ok) throw new Error("discord_unavailable");
  const dm = await response.json();
  if (dm.type !== 1 || !/^\d{17,20}$/.test(dm.id ?? "") || dm.recipients?.length !== 1 || dm.recipients[0]?.id !== config.recipient) throw new Error("discord_unavailable");
  const result = await post(`/channels/${dm.id}/messages`, { content: text.slice(0, 2000), allowed_mentions: { parse: [] },
    nonce: createHash("sha256").update(key).digest("hex").slice(0, 24), enforce_nonce: true });
  if (!result.ok) throw new Error(result.status === 403 ? "discord_dm_blocked" : "discord_unavailable");
}

async function deliver(id: string) {
  const row = await repository.get(id);
  if (!row || row.status !== "pending") return "unchanged";
  const token = randomUUID();
  if (!await repository.claim(row, token)) return "unchanged";
  let state: "pending" | "sent" | "skipped" = "pending";
  let code: string | null = null;
  try {
    const notice = await getMentorshipNotice(id);
    if (!notice) state = "skipped";
    else {
      await sendMentorshipDiscordMessage(notice.text, `booking:${id}`);
      state = "sent";
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "";
    code = ["configuration", "discord_dm_blocked"].includes(reason) ? reason : "discord_unavailable";
  }
  await repository.finish(id, token, state, code);
  return state;
}

export const MentorshipDiscordService = {
  async notifyBooking(id: string, profileId: string) {
    const booking = await repository.getBooking(id);
    if (!booking || booking.status !== "confirmed" || booking.profile_id !== profileId) return;
    const slot = await repository.getSlot(booking.slot_id);
    if (!slot) throw new Error("MENTORSHIP_NOTICE_UNAVAILABLE");
    await repository.enqueue({ booking_id: id, booked_at: booking.booked_at, starts_at: slot.starts_at, ends_at: slot.ends_at });
    return deliver(id);
  },
  async retryPending() {
    const result = { sent: 0, pending: 0, skipped: 0 };
    for (const row of await repository.pending()) {
      const state = await deliver(row.booking_id);
      if (state === "sent") result.sent++;
      else if (state === "skipped") result.skipped++;
      else result.pending++;
    }
    return result;
  },
};
