import { getSupabaseClient } from "@/lib/database/client";
import type { AdminUserRow } from "@/lib/types/admin.types";

export const AdminRepository = {
  async findCurrentAdminUser(): Promise<AdminUserRow | null> {
    const supabase = getSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id, created_at, created_by")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as unknown as AdminUserRow | null) ?? null;
  },
};
