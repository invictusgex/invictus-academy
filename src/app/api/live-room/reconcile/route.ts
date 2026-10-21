import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { LiveRoomRepository } from "@/lib/repositories/live-room.repository";
import { liveRoomIsLive } from "@/lib/services/live-room-config";
import { LiveRoomService } from "@/lib/services/live-room.service";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const secret = process.env.LIVE_ROOM_RECONCILE_SECRET?.trim();
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const suppliedBytes = Buffer.from(header);
  const expectedBytes = Buffer.from(expected);
  if (!secret || suppliedBytes.length !== expectedBytes.length || !timingSafeEqual(suppliedBytes, expectedBytes)) return new NextResponse(null, { status: 401 });
  try {
    const rows = await LiveRoomRepository.listNeedsSync(liveRoomIsLive());
    let failed = 0;
    for (const row of rows) {
      try { await LiveRoomService.sync(row.profile_id); } catch { failed += 1; }
    }
    return NextResponse.json({ checked: rows.length, failed }, { status: failed ? 503 : 200, headers: { "Cache-Control": "no-store" } });
  } catch { return new NextResponse(null, { status: 503 }); }
}
