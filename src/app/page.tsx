import { PublicLanding } from "@/components/landing/PublicLanding";
import { getAcademyProgram } from "@/lib/academy";

export const dynamic = "force-dynamic";

export default async function Home() {
  const course = await getAcademyProgram();

  return <PublicLanding course={course} />;
}
