import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

// Auth signup must not set a user's session on the shared service-role client.
export function createSupabaseRegistrationClient() {
  const config = getSupabasePublicConfig();
  return createClient<Database>(config.url, config.anonKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}
