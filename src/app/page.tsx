import { PublicLanding } from "@/components/landing/PublicLanding";
import { getAcademyProgram } from "@/lib/academy";

export default async function Home() {
  const course = await getAcademyProgram();

  return <PublicLanding course={course} />;
}
