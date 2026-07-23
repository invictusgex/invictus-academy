import { StudentDashboard } from "@/components/academy/dashboard/StudentDashboard";
import { AcademyShell } from "@/components/layout/academy-shell";
import { getAcademyProgram } from "@/lib/academy";

export default async function AcademyPage() {
  const course = await getAcademyProgram();

  return (
    <AcademyShell>
      <StudentDashboard course={course} />
    </AcademyShell>
  );
}
