import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  passwordRecoveryCookieName,
  passwordRecoveryCookieValue,
} from "@/lib/auth/password-recovery";
import {
  checkRateLimit,
  createSimpleRateLimitResponse,
  getRateLimitIdentity,
} from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function invalidRecoveryResponse() {
  return NextResponse.json(
    {
      error: "Este enlace de recuperación no es válido o ha expirado.",
    },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth:reset-password:${getRateLimitIdentity(request)}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return createSimpleRateLimitResponse(
      "Demasiados intentos de actualización. Intenta nuevamente en unos minutos.",
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
  const password = typeof body.password === "string" ? body.password : "";
  const passwordConfirmation =
    typeof body.passwordConfirmation === "string"
      ? body.passwordConfirmation
      : "";

  if (password.length < 8) {
    return NextResponse.json(
      { error: "La nueva contraseña debe tener al menos 8 caracteres." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (password !== passwordConfirmation) {
    return NextResponse.json(
      { error: "Las contraseñas no coinciden." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const cookieStore = await cookies();
  const recoveryVerified =
    cookieStore.get(passwordRecoveryCookieName)?.value ===
    passwordRecoveryCookieValue;

  if (!recoveryVerified) {
    return invalidRecoveryResponse();
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return invalidRecoveryResponse();
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return NextResponse.json(
      {
        error:
          "No pudimos actualizar la contraseña. Solicita un nuevo enlace e intenta nuevamente.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const response = NextResponse.json(
    { message: "Tu contraseña fue actualizada correctamente." },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );

  response.cookies.set({
    maxAge: 0,
    name: passwordRecoveryCookieName,
    path: "/",
    value: "",
  });

  return response;
}
