import { supabase } from "@/lib/database/client";

// Centraliza el acceso a Supabase Auth para evitar imports directos en UI.
export const authClient = supabase.auth;
