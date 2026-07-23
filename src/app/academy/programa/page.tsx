import { StudentProgramPage } from "@/components/academy/program/StudentProgramPage";
import { AcademyShell } from "@/components/layout/academy-shell";
import { getAcademyProgram } from "@/lib/academy";

export default async function AcademyProgramPage() {
  const course = await getAcademyProgram();

  return (
    <AcademyShell>
      <StudentProgramPage course={course} />
    </AcademyShell>
  );
}
