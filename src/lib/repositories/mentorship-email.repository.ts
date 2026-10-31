import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { MentorshipEmailDeliveryRow } from "@/lib/types/mentorship-email.types";

function check(error: unknown) { if (error) throw new Error("MENTORSHIP_EMAIL_STORAGE_UNAVAILABLE"); }
const table = () => getSupabaseAdminClient().from("mentorship_email_deliveries");

export const MentorshipEmailRepository = {
  async getBooking(id: string) {
    const { data, error } = await getSupabaseAdminClient().from("academy_mentorship_bookings")
      .select("id,status,profile_id,slot_id,booked_at").eq("id", id).maybeSingle();
    check(error); return data;
  },
  async getSlot(id: string) {
    const { data, error } = await getSupabaseAdminClient().from("academy_mentorship_slots")
      .select("starts_at,ends_at").eq("id", id).maybeSingle();
    check(error); return data;
  },
  async enqueue(row: Pick<MentorshipEmailDeliveryRow, "booking_id" | "booked_at" | "starts_at" | "ends_at">) {
    const { error } = await table().upsert(row, { onConflict: "booking_id", ignoreDuplicates: true });
    check(error);
  },
  async get(id: string) {
    const { data, error } = await table().select("*").eq("booking_id", id).maybeSingle();
    check(error); return data;
  },
  async pending() {
    const { data, error } = await table().select("*").eq("status", "pending").order("booked_at").limit(3);
    check(error); return data ?? [];
  },
  async recent() {
    const { data, error } = await table().select("*").order("booked_at", { ascending: false }).limit(10);
    check(error); return data ?? [];
  },
  async claim(row: MentorshipEmailDeliveryRow, token: string) {
    const now = new Date();
    const { data, error } = await table().update({ lease_token: token, lease_until: new Date(now.getTime() + 60000).toISOString(), attempts: row.attempts + 1 })
      .eq("booking_id", row.booking_id).eq("status", "pending")
      .or(`lease_until.is.null,lease_until.lt.${now.toISOString()}`).select("booking_id");
    check(error); return Boolean(data?.length);
  },
  async finish(id: string, token: string, status: "pending" | "sent" | "skipped", errorCode: string | null) {
    const { error } = await table().update({ status, sent_at: status === "sent" ? new Date().toISOString() : null, last_error: errorCode, lease_token: null, lease_until: null })
      .eq("booking_id", id).eq("lease_token", token);
    check(error);
  },
};
