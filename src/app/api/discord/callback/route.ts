import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireServerAuthContext } from "@/lib/auth/server";
import { DiscordMembershipService } from "@/lib/services/discord-membership.service";
import { liveRoomAppUrl, liveRoomIsLive } from "@/lib/services/live-room-config";
import { LiveRoomService } from "@/lib/services/live-room.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const stored = cookieStore.get("invictus_discord_state")?.value;
  cookieStore.delete({ name: "invictus_discord_state", path: "/api/discord/callback" });
  let success = false;
  try {
    const { profile } = await requireServerAuthContext();
    const params = new URL(request.url).searchParams;
    const state = params.get("state") ?? "";
    const code = params.get("code");
    const saved = stored ? JSON.parse(stored) : null;
    if (!saved || !code || !/^[a-f0-9]{64}$/.test(state) || typeof saved.state !== "string" || saved.state.length !== state.length ||
      !timingSafeEqual(Buffer.from(saved.state), Buffer.from(state)) || saved.profileId !== profile.id || saved.livemode !== liveRoomIsLive()) {
      throw new Error("INVALID_OAUTH_STATE");
    }
    const identity = await DiscordMembershipService.identify(code);
    await LiveRoomService.linkDiscord(profile.id, identity);
    success = true;
  } catch {
    // OAuth URLs contain codes: never log the URL or provider's raw error.
  }
  const response = NextResponse.redirect(`${liveRoomAppUrl()}/sala-en-vivo/suscripcion?discord=${success ? "connected" : "error"}`);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
