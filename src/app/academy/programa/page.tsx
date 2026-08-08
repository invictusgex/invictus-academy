import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { NoActiveProgramState } from "@/components/academy/NoActiveProgramState";
import { StudentProgramPage } from "@/components/academy/program/StudentProgramPage";
import { AcademyShell } from "@/components/layout/academy-shell";
import { getAcademyProgram } from "@/lib/academy";
import { academyProductSlug } from "@/lib/academy-product";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProgressProvider } from "@/providers/ProgressProvider";

export default async function AcademyProgramPage() {
  const { profile } = await requireAcademyAuthContext();
  const supabase = await createSupabaseServerClient();
  const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);

  if (!academyAccess.hasAcademyProgramAccess) {
    return (
      <AcademyShell>
        <NoActiveProgramState description="Cuando adquieras una formación, tu programa aparecerá aquí junto con tu progreso y recursos." />
      </AcademyShell>
    );
  }

  const course = await getAcademyProgram();

  return (
    <AcademyShell>
      <ProgressProvider
        course={course}
        productSlug={academyProductSlug}
        programId={course.id}
      >
        <StudentProgramPage />
      </ProgressProvider>
    </AcademyShell>
  );
}
