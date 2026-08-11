import { NextResponse } from "next/server";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import {
  checkRateLimit,
  createSimpleRateLimitResponse,
  getRateLimitIdentity,
} from "@/lib/security/rate-limit";
import { activateCurrentAuthSession } from "@/lib/services/auth-active-session.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function jsonResponse(body: { error?: string; ok?: true }, status: number) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
    status,
  });
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return jsonResponse(
        {
          error: "Debes iniciar sesi\u00f3n para registrar este dispositivo.",
        },
        401,
      );
    }

    const rateLimit = checkRateLimit({
      key: `auth:active-session:${getRateLimitIdentity(request, data.user.id)}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return createSimpleRateLimitResponse(
        "Demasiados intentos de registrar este dispositivo. Intenta nuevamente en unos minutos.",
        rateLimit.retryAfterSeconds,
      );
    }

    await activateCurrentAuthSession(supabase, data.user);

    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    if (error instanceof ServerAuthError) {
      return jsonResponse(
        {
          error:
            error.code === SERVER_AUTH_ERROR_CODES.SESSION_REPLACED
              ? "Esta cuenta ya tiene una sesi\u00f3n activa en otro dispositivo."
              : "No se pudo registrar este dispositivo.",
        },
        error.status,
      );
    }

    return jsonResponse(
      {
        error: "No se pudo registrar este dispositivo.",
      },
      500,
    );
  }
}
