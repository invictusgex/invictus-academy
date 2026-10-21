import "server-only";
import { liveRoomEnv, liveRoomCallbackUrl } from "@/lib/services/live-room-config";

async function discordRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    ...options, cache: "no-store", signal: AbortSignal.timeout(10_000),
    headers: { Authorization: `Bot ${liveRoomEnv("DISCORD_BOT_TOKEN")}`, "Content-Type": "application/json", ...options.headers },
  });
  if (options.method === "DELETE" && response.status === 404) return null;
  if (!response.ok) throw new Error("LIVE_ROOM_DISCORD_UNAVAILABLE");
  return response.status === 204 ? null : response.json();
}
export const DiscordMembershipService = {
  authorizationUrl(state: string) {
    const url = new URL("https://discord.com/oauth2/authorize");
    url.search = new URLSearchParams({
      client_id: liveRoomEnv("DISCORD_CLIENT_ID"), response_type: "code",
      redirect_uri: liveRoomCallbackUrl(), scope: "identify guilds.join", state, prompt: "consent",
    }).toString();
    return url.toString();
  },
  async identify(code: string): Promise<{ id: string; username: string; accessToken: string }> {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(10_000),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: liveRoomEnv("DISCORD_CLIENT_ID"), client_secret: liveRoomEnv("DISCORD_CLIENT_SECRET"),
        grant_type: "authorization_code", code, redirect_uri: liveRoomCallbackUrl(),
      }),
    });
    if (!response.ok) throw new Error("LIVE_ROOM_DISCORD_UNAVAILABLE");
    const token = await response.json();
    if (typeof token.access_token !== "string") throw new Error("LIVE_ROOM_DISCORD_UNAVAILABLE");
    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      cache: "no-store", signal: AbortSignal.timeout(10_000), headers: { Authorization: `Bearer ${token.access_token}` },
    });
    if (!userResponse.ok) throw new Error("LIVE_ROOM_DISCORD_UNAVAILABLE");
    const user = await userResponse.json();
    if (!/^\d{17,20}$/.test(user.id)) throw new Error("LIVE_ROOM_DISCORD_UNAVAILABLE");
    return { id: user.id, username: user.username, accessToken: token.access_token };
  },
  async join(discordId: string, accessToken: string) {
    await discordRequest(`/guilds/${liveRoomEnv("DISCORD_GUILD_ID")}/members/${discordId}`, {
      method: "PUT", body: JSON.stringify({ access_token: accessToken }),
    });
  },
  async setRole(discordId: string, allowed: boolean) {
    await discordRequest(`/guilds/${liveRoomEnv("DISCORD_GUILD_ID")}/members/${discordId}/roles/${liveRoomEnv("DISCORD_MEMBER_ROLE_ID")}`, { method: allowed ? "PUT" : "DELETE" });
  },
  async assertMember(discordId: string) {
    const member = await discordRequest(`/guilds/${liveRoomEnv("DISCORD_GUILD_ID")}/members/${discordId}`);
    if (!member || member.pending) throw new Error("LIVE_ROOM_DISCORD_MEMBERSHIP_PENDING");
  },
  channelUrl() {
    return `https://discord.com/channels/${liveRoomEnv("DISCORD_GUILD_ID")}/${liveRoomEnv("DISCORD_LIVE_CHANNEL_ID")}`;
  },
};
