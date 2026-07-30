import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabasePublicConfig,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient() {
  const config = getSupabasePublicConfig();

  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient =
    typeof window === "undefined"
      ? createClient<Database>(config.url, config.anonKey)
      : createBrowserClient<Database>(config.url, config.anonKey);

  return supabaseClient;
}

export { isSupabaseConfigured };
