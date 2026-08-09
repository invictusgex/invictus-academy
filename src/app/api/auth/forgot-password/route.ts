import { NextResponse } from "next/server";

import { getSiteUrl } from "@/config/site";
import { getSafeInternalRedirect } from "@/lib/auth/redirects";
import {
  checkRateLimit,
  createSimpleRateLimitResponse,
  getRateLimitIdentity,
} from "@/lib/security/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const genericMessage =
  "Si el email corresponde a una cuenta, recibirás instrucciones para continuar.";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth:forgot-password:${getRateLimitIdentity(request)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return createSimpleRateLimitResponse(
      "Demasiadas solicitudes de recuperación. Intenta nuevamente en unos minutos.",
      rateLimit.retryAfterSeconds,
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "La solicitud no contiene JSON válido." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const body =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  const email = normalizeEmail(body.email);
  const next = getSafeInternalRedirect(
    typeof body.next === "string" ? body.next : null,
    "/academy",
  );

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Ingresa un email válido." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = getSupabaseAdminClient();
  const redirectTo = `${getSiteUrl()}/auth/confirm?type=recovery&next=${encodeURIComponent(
    `/reset-password?next=${encodeURIComponent(next)}`,
  )}`;

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  return NextResponse.json(
    { message: genericMessage },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
