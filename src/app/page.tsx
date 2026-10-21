import { PublicLanding } from "@/components/landing/PublicLanding";
import { getAcademyProgram } from "@/lib/academy";
import { LiveRoomService } from "@/lib/services/live-room.service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [course, offer] = await Promise.all([getAcademyProgram(), LiveRoomService.getOffer()]);

  return <PublicLanding course={course} roomDescription={offer.description} />;
}
