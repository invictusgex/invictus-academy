import { DashboardHero } from "@/components/academy/DashboardHero";
import { DashboardProgressCenter } from "@/components/academy/DashboardProgressCenter";
import { AcademyShell } from "@/components/layout/academy-shell";
import { getAcademyProgram } from "@/lib/academy";

export default async function AcademyPage() {
  const course = await getAcademyProgram();

  return (
    <AcademyShell>
      <DashboardHero userName="Ariel" />
      <DashboardProgressCenter course={course} />
    </AcademyShell>
  );
}
