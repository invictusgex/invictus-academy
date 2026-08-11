import { NextResponse } from "next/server";

import {
  passwordRecoveryCookieMaxAge,
  passwordRecoveryCookieName,
  passwordRecoveryCookieValue,
} from "@/lib/auth/password-recovery";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json(
      { error: "Este enlace de recuperación no es válido o ha expirado." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const response = NextResponse.json(
    { message: "Sesión de recuperación validada." },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );

  response.cookies.set({
    httpOnly: true,
    maxAge: passwordRecoveryCookieMaxAge,
    name: passwordRecoveryCookieName,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: passwordRecoveryCookieValue,
  });

  return response;
}
