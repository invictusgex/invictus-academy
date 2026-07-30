import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdminConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

let supabaseAdminClient: SupabaseClient<Database> | null = null;

export function getSupabaseAdminClient() {
  const config = getSupabaseAdminConfig();

  supabaseAdminClient ??= createClient<Database>(
    config.url,
    config.serviceRoleKey,
    {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    },
  );

  return supabaseAdminClient;
}
