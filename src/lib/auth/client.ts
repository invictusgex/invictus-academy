import { getSupabaseClient } from "@/lib/database/client";

// Centraliza el acceso a Supabase Auth para evitar imports directos en UI.
export function getAuthClient() {
  return getSupabaseClient().auth;
}
