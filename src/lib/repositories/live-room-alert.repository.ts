import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LiveRoomAlertRow } from "@/lib/types/live-room-alert.types";

function check(error: unknown) { if (error) throw new Error("LIVE_ROOM_ALERT_STORAGE_UNAVAILABLE"); }
const table = () => getSupabaseAdminClient().from("live_room_alert_deliveries");
export const LiveRoomAlertRepository = {
  async enqueue(row: Pick<LiveRoomAlertRow, "id" | "kind" | "occurred_at" | "livemode">) {
    const { error } = await table().upsert(row, { onConflict: "id", ignoreDuplicates: true });
    check(error);
  },
  async pending(livemode: boolean) {
    const { data, error } = await table().select("*").eq("livemode", livemode).is("sent_at", null).order("occurred_at").limit(3);
    check(error); return data ?? [];
  },
  async claim(row: LiveRoomAlertRow, token: string) {
    const now = new Date();
    const { data, error } = await table().update({ lease_token: token, lease_until: new Date(now.getTime() + 60000).toISOString(), last_attempt_at: now.toISOString(), attempts: row.attempts + 1 })
      .eq("id", row.id).is("sent_at", null).or(`lease_until.is.null,lease_until.lt.${now.toISOString()}`).select("id");
    check(error); return Boolean(data?.length);
  },
  async finish(id: string, token: string, sent: boolean) {
    const { error } = await table().update({ sent_at: sent ? new Date().toISOString() : null, lease_token: null, lease_until: null, last_failed: !sent }).eq("id", id).eq("lease_token", token);
    check(error);
  },
  async recent(livemode: boolean) {
    const { data, error } = await table().select("kind,occurred_at,sent_at,last_failed,attempts").eq("livemode", livemode).order("occurred_at", { ascending: false }).limit(10);
    check(error); return data ?? [];
  },
};
