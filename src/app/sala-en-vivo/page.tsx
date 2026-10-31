import type { Metadata } from "next";

import { PublicLiveRoomPage } from "@/components/live-room/PublicLiveRoomPage";
import { liveRoom } from "@/content/live-room";
import { LiveRoomService } from "@/lib/services/live-room.service";
import { LiveRoomComingSoon } from "@/components/live-room/LiveRoomComingSoon";
import { liveRoomEnrollmentOpen } from "@/lib/services/live-room-enrollment";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: liveRoom.title,
  description: liveRoom.description,
  alternates: { canonical: liveRoom.publicHref },
};

export default async function LiveRoomPage() {
  const offer = await LiveRoomService.getOffer();
  return liveRoomEnrollmentOpen ? <PublicLiveRoomPage offer={offer} /> : <LiveRoomComingSoon offer={offer} />;
}
