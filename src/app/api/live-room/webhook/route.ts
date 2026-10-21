import { NextResponse } from "next/server";
import { getLiveRoomStripe, liveRoomEnv } from "@/lib/services/live-room-config";
import { LiveRoomService } from "@/lib/services/live-room.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new NextResponse(null, { status: 400 });
  let stripe;
  let secret;
  try { stripe = getLiveRoomStripe(); secret = liveRoomEnv("STRIPE_LIVE_ROOM_WEBHOOK_SECRET"); }
  catch { return new NextResponse(null, { status: 503 }); }
  let event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return new NextResponse(null, { status: 400 }); }
  try {
    await LiveRoomService.handleWebhook(event);
    return NextResponse.json({ received: true });
  } catch {
    // Stripe must retry if persistence or Discord synchronization fails.
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
