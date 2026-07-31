import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "La solicitud no contiene JSON valido." },
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
      { error: "La nueva contrasena debe tener al menos 8 caracteres." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (password !== passwordConfirmation) {
    return NextResponse.json(
      { error: "Las contrasenas no coinciden." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return NextResponse.json(
      {
        error:
          "No pudimos actualizar la contrasena. Solicita un nuevo enlace e intenta nuevamente.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { message: "Tu contrasena fue actualizada correctamente." },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
