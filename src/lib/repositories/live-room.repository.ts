import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LiveRoomAccountRow } from "@/lib/types/live-room.types";

function check(error: { code?: string } | null) {
  if (!error) return;
  if (["42P01", "PGRST205", "PGRST202"].includes(error.code ?? "")) throw new Error("LIVE_ROOM_SCHEMA_PENDING");
  throw new Error("LIVE_ROOM_STORAGE_ERROR");
}

export const LiveRoomRepository = {
  async get(profileId: string, livemode: boolean) {
    const { data, error } = await getSupabaseAdminClient().from("live_room_accounts")
      .select("*").eq("profile_id", profileId).eq("livemode", livemode).maybeSingle();
    check(error);
    return data;
  },
  async update(profileId: string, livemode: boolean, token: string, values: Partial<LiveRoomAccountRow>) {
    const { data, error } = await getSupabaseAdminClient().from("live_room_accounts")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("profile_id", profileId).eq("livemode", livemode).eq("operation_token", token).select().single();
    check(error);
    return data!;
  },
  async claim(profileId: string, livemode: boolean, token: string) {
    const { data, error } = await getSupabaseAdminClient().rpc("claim_live_room_operation", {
      p_profile_id: profileId, p_livemode: livemode, p_token: token,
    });
    check(error);
    if (!data) throw new Error("LIVE_ROOM_BUSY");
  },
  async release(profileId: string, livemode: boolean, token: string) {
    const { error } = await getSupabaseAdminClient().from("live_room_accounts")
      .update({ operation_token: null, operation_until: null })
      .eq("profile_id", profileId).eq("livemode", livemode).eq("operation_token", token);
    check(error);
  },
  async getDescription() {
    const { data, error } = await getSupabaseAdminClient().from("live_room_settings")
      .select("description").eq("id", true).maybeSingle();
    check(error);
    return data?.description ?? null;
  },
  async saveDescription(description: string) {
    const { error } = await getSupabaseAdminClient().from("live_room_settings")
      .update({ description, updated_at: new Date().toISOString() }).eq("id", true);
    check(error);
  },
  async listNeedsSync(livemode: boolean) {
    const { data, error } = await getSupabaseAdminClient().from("live_room_accounts")
      .select("profile_id").eq("livemode", livemode).or("needs_sync.eq.true,role_synced.eq.true")
      .order("updated_at", { ascending: true }).limit(25);
    check(error);
    return data ?? [];
  },
};
