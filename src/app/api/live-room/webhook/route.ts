import { after, NextResponse } from "next/server";
import { getLiveRoomStripe, liveRoomEnv } from "@/lib/services/live-room-config";
import { LiveRoomService } from "@/lib/services/live-room.service";
import { LiveRoomAlertsService } from "@/lib/services/live-room-alerts.service";

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
  let syncFailed = false;
  try { await LiveRoomService.handleWebhook(event); } catch { syncFailed = true; }
  // Notifications are independent: email/storage failures must never change Stripe's response.
  try {
    after(async () => {
      try { await LiveRoomAlertsService.captureEvent(event, syncFailed); await LiveRoomAlertsService.deliverPending(); }
      catch { console.error("[live-room:alerts] pending_notice_unavailable"); }
    });
  } catch { console.error("[live-room:alerts] background_unavailable"); }
  return NextResponse.json({ received: !syncFailed }, { status: syncFailed ? 500 : 200 });
}
