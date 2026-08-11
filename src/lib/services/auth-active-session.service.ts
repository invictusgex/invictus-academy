import "server-only";

import type { User } from "@supabase/supabase-js";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import { getCurrentAuthSessionId } from "@/lib/auth/session-token";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

const activeSessionMetadataKey = "active_session_id";

function getStoredActiveSessionId(user: User) {
  const value = user.app_metadata?.[activeSessionMetadataKey];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function activateCurrentAuthSession(
  supabase: SupabaseServerClient,
  user: User,
) {
  const sessionId = await getCurrentAuthSessionId(supabase);

  if (!sessionId) {
    throw new ServerAuthError(
      SERVER_AUTH_ERROR_CODES.AUTH_PROVIDER_ERROR,
      "No se pudo identificar la sesi\u00f3n autenticada.",
      {
        status: 502,
      },
    );
  }

  const admin = getSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      [activeSessionMetadataKey]: sessionId,
    },
  });

  if (error) {
    throw new ServerAuthError(
      SERVER_AUTH_ERROR_CODES.AUTH_PROVIDER_ERROR,
      "No se pudo registrar la sesi\u00f3n activa.",
      {
        status: 502,
        cause: error,
      },
    );
  }
}
export async function assertCurrentAuthSessionIsActive(
  supabase: SupabaseServerClient,
  user: User,
) {
  const activeSessionId = getStoredActiveSessionId(user);

  if (!activeSessionId) {
    return;
  }

  const currentSessionId = await getCurrentAuthSessionId(supabase);

  if (!currentSessionId || currentSessionId !== activeSessionId) {
    throw new ServerAuthError(
      SERVER_AUTH_ERROR_CODES.SESSION_REPLACED,
      "Esta cuenta ya tiene una sesi\u00f3n activa en otro dispositivo.",
      {
        status: 401,
      },
    );
  }
}
