import { DashboardHero } from "@/components/academy/DashboardHero";
import { DashboardProgressCenter } from "@/components/academy/DashboardProgressCenter";
import { AcademyShell } from "@/components/layout/academy-shell";
import { getAcademyProgram } from "@/lib/academy";

export default function AcademyPage() {
  const course = getAcademyProgram();

  return (
    <AcademyShell>
      <DashboardHero userName="Ariel" />
      <DashboardProgressCenter course={course} />
    </AcademyShell>
  );
}
