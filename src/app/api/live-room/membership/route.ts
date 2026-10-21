import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireServerAuthContext } from "@/lib/auth/server";
import { checkRateLimit, createRateLimitResponse, getRateLimitIdentity } from "@/lib/security/rate-limit";
import { DiscordMembershipService } from "@/lib/services/discord-membership.service";
import { liveRoomAppUrl, liveRoomIsLive } from "@/lib/services/live-room-config";
import { liveRoomError } from "@/lib/services/live-room-http";
import { LiveRoomService } from "@/lib/services/live-room.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== liveRoomAppUrl()) return new NextResponse(null, { status: 403 });
    const { profile, user } = await requireServerAuthContext();
    const limit = checkRateLimit({ key: `live-room:${getRateLimitIdentity(request, profile.id)}`, limit: 12, windowMs: 10 * 60_000 });
    if (!limit.allowed) return createRateLimitResponse("Demasiadas solicitudes. Intenta nuevamente en unos minutos.", limit.retryAfterSeconds);
    const body = await request.json();
    if (!body || typeof body !== "object" || Object.keys(body).length !== 1 || !["connect", "checkout", "portal", "sync"].includes(body.action)) {
      return NextResponse.json({ error: "Solicitud no válida." }, { status: 400 });
    }
    if (body.action === "connect") {
      // Require the schema before issuing OAuth so a successful consent can be persisted.
      await LiveRoomService.getAccount(profile.id);
      const state = randomBytes(32).toString("hex");
      const response = NextResponse.json({ url: DiscordMembershipService.authorizationUrl(state) });
      response.cookies.set("invictus_discord_state", JSON.stringify({ state, profileId: profile.id, livemode: liveRoomIsLive() }), {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/discord/callback", maxAge: 600,
      });
      response.headers.set("Cache-Control", "no-store");
      return response;
    }
    const result = body.action === "checkout" ? await LiveRoomService.startCheckout(profile.id, user.email)
      : body.action === "portal" ? await LiveRoomService.portal(profile.id)
      : (await LiveRoomService.sync(profile.id), { updated: true });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return liveRoomError(error); }
}
