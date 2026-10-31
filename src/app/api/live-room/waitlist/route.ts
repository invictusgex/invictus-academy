import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getRateLimitIdentity } from "@/lib/security/rate-limit";

const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: "Solicitud no permitida." }, 403);
  const limit = checkRateLimit({ key: `room-waitlist:${getRateLimitIdentity(request)}`, limit: 5, windowMs: 60 * 60_000 });
  if (!limit.allowed) return reply({ error: "Demasiados intentos. Vuelve a probar más tarde." }, 429);
  if (Number(request.headers.get("content-length")) > 2048) return reply({ error: "Solicitud demasiado grande." }, 413);
  let body;
  try { body = await request.json(); } catch { return reply({ error: "Solicitud no válida." }, 400); }
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (body?.website) return reply({ message: "Gracias por tu interés." });
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || body?.consent !== true) {
    return reply({ error: "Introduce un correo válido y acepta recibir el aviso de apertura." }, 400);
  }
  try {
    const { error } = await getSupabaseAdminClient().from("live_room_waitlist").insert({ email, consent_version: "opening-notice-v1" });
    if (error && error.code !== "23505") throw error;
    return reply({ message: "Ya estás en la lista. Te avisaremos cuando abran las inscripciones." });
  } catch {
    console.error("[live-room:waitlist] storage_unavailable");
    return reply({ error: "No pudimos guardar tu correo. Inténtalo de nuevo en unos minutos." }, 503);
  }
}
