import "server-only";
import { NextResponse } from "next/server";
import { ServerAuthError } from "@/lib/auth/server-errors";

export function liveRoomError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const messages: Record<string, string> = {
    LIVE_ROOM_SCHEMA_PENDING: "La sala está en configuración. Todavía no se ha habilitado la suscripción.",
    LIVE_ROOM_NOT_CONFIGURED: "La suscripción todavía no está disponible.",
    LIVE_ROOM_BUSY: "Tu membresía se está actualizando. Intenta de nuevo en unos segundos.",
    LIVE_ROOM_DISCORD_REQUIRED: "Vincula tu cuenta de Discord antes de suscribirte.",
    LIVE_ROOM_DISCORD_ALREADY_LINKED: "Ya tienes otra cuenta de Discord vinculada. Contacta con soporte para cambiarla.",
    LIVE_ROOM_DISCORD_UNAVAILABLE: "No pudimos actualizar el acceso a Discord. Intenta nuevamente.",
    LIVE_ROOM_DISCORD_MEMBERSHIP_PENDING: "Entra al servidor de Discord y completa sus requisitos de acceso antes de suscribirte.",
    LIVE_ROOM_PRICE_UNAVAILABLE: "No pudimos consultar el precio mensual. Intenta nuevamente.",
  };
  return NextResponse.json({ error: error instanceof ServerAuthError ? "Inicia sesión para continuar." : messages[code] ?? "No pudimos gestionar tu membresía. Intenta nuevamente." }, {
    status: error instanceof ServerAuthError ? error.status : code === "LIVE_ROOM_BUSY" ? 409 : 503,
    headers: { "Cache-Control": "no-store", ...(code === "LIVE_ROOM_BUSY" ? { "Retry-After": "5" } : {}) },
  });
}
