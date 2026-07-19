import { PublicLanding } from "@/components/landing/PublicLanding";
import { getAcademyProgram } from "@/lib/academy";

export default function Home() {
  const course = getAcademyProgram();

  return <PublicLanding course={course} />;
}
