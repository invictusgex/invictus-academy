import { NextResponse } from "next/server";

import { getSiteUrl } from "@/config/site";
import {
  checkRateLimit,
  createSimpleRateLimitResponse,
  getRateLimitIdentity,
} from "@/lib/security/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const genericMessage =
  "Si el email corresponde a una cuenta, recibirás instrucciones para continuar.";
const deliveryErrorMessage =
  "No pudimos enviar instrucciones en este momento. Intenta nuevamente en unos minutos.";

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

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Ingresa un email válido." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = getSupabaseAdminClient();
  const redirectTo = `${getSiteUrl()}/auth/confirm?flow=recovery&next=${encodeURIComponent(
    "/reset-password",
  )}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return NextResponse.json(
      { error: deliveryErrorMessage },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { message: genericMessage },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
