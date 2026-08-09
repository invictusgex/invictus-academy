import { PublicProgramPage } from "@/components/program/PublicProgramPage";
import { getAcademyProgram } from "@/lib/academy";

export const dynamic = "force-dynamic";

export default async function ProgramPage() {
  const course = await getAcademyProgram();

  return <PublicProgramPage course={course} />;
}
