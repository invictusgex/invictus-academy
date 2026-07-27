import { StudentProgramPage } from "@/components/academy/program/StudentProgramPage";
import { AcademyShell } from "@/components/layout/academy-shell";

export default function AcademyProgramPage() {
  return (
    <AcademyShell>
      <StudentProgramPage />
    </AcademyShell>
  );
}
