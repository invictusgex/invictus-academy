import "server-only";

import { redirect } from "next/navigation";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import { requireServerAuthContext } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdminServerContext() {
  try {
    const authContext = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", authContext.profile.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      redirect("/academy");
    }

    return {
      ...authContext,
      supabase,
    };
  } catch (error) {
    if (
      error instanceof ServerAuthError &&
      (error.code === SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED ||
        error.code === SERVER_AUTH_ERROR_CODES.SESSION_REPLACED)
    ) {
      redirect("/login");
    }

    throw error;
  }
}
