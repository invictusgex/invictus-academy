import { AcademyEnrollmentEmptyState } from "@/components/academy/AcademyEnrollmentEmptyState";
import { StudentDashboard } from "@/components/academy/dashboard/StudentDashboard";
import { StudentProgramsOverview } from "@/components/academy/dashboard/StudentProgramsOverview";
import { AcademyShell } from "@/components/layout/academy-shell";
import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { getAcademyProgram } from "@/lib/academy";
import { academyProductSlug } from "@/lib/academy-product";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProgressProvider } from "@/providers/ProgressProvider";

export default async function AcademyPage() {
  const { profile } = await requireAcademyAuthContext();
  const supabase = await createSupabaseServerClient();
  const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);

  if (!academyAccess.hasAnyActiveEnrollment) {
    return (
      <AcademyShell>
        <AcademyEnrollmentEmptyState />
      </AcademyShell>
    );
  }

  if (!academyAccess.hasAcademyProgramAccess) {
    return (
      <AcademyShell>
        <StudentProgramsOverview activeProducts={academyAccess.activeProducts} />
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
        <StudentDashboard activeProducts={academyAccess.activeProducts} />
      </ProgressProvider>
    </AcademyShell>
  );
}
