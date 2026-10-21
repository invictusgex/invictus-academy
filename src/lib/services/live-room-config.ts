import "server-only";
import Stripe from "stripe";

export function liveRoomEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error("LIVE_ROOM_NOT_CONFIGURED");
  return value;
}
export function getLiveRoomStripe() {
  return new Stripe(liveRoomEnv("STRIPE_LIVE_ROOM_SECRET_KEY"), { timeout: 10_000, maxNetworkRetries: 1 });
}
export function liveRoomIsLive() {
  return /^(sk|rk)_live_/.test(liveRoomEnv("STRIPE_LIVE_ROOM_SECRET_KEY"));
}
export function liveRoomAppUrl() {
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  const url = new URL(process.env.APP_URL?.trim() || "https://invictusgex.com");
  if (url.protocol !== "https:" || !["invictusgex.com", "www.invictusgex.com"].includes(url.hostname)) throw new Error("LIVE_ROOM_NOT_CONFIGURED");
  return url.origin;
}
export function liveRoomCallbackUrl() {
  return `${liveRoomAppUrl()}/api/discord/callback`;
}
