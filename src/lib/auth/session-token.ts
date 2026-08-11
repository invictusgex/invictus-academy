import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

type JwtPayload = {
  session_id?: unknown;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return Buffer.from(padded, "base64").toString("utf8");
}

function readSessionIdFromAccessToken(accessToken: string | null | undefined) {
  if (!accessToken) {
    return null;
  }

  const [, payload] = accessToken.split(".");

  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as JwtPayload;

    return typeof parsed.session_id === "string" && parsed.session_id.trim()
      ? parsed.session_id.trim()
      : null;
  } catch {
    return null;
  }
}

export async function getCurrentAuthSessionId(
  supabase: SupabaseClient<Database>,
) {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return readSessionIdFromAccessToken(data.session?.access_token);
}
