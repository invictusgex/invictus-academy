import { StudentDashboard } from "@/components/academy/dashboard/StudentDashboard";
import { AcademyShell } from "@/components/layout/academy-shell";

export default function AcademyPage() {
  return (
    <AcademyShell>
      <StudentDashboard />
    </AcademyShell>
  );
}
