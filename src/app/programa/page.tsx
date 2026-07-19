import { PublicProgramPage } from "@/components/program/PublicProgramPage";
import { getAcademyProgram } from "@/lib/academy";

export default function ProgramPage() {
  const course = getAcademyProgram();

  return <PublicProgramPage course={course} />;
}
