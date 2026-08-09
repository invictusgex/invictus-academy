import { AcademyEnrollmentEmptyState } from "@/components/academy/AcademyEnrollmentEmptyState";
import { StudentDashboard } from "@/components/academy/dashboard/StudentDashboard";
import { StudentProgramsOverview } from "@/components/academy/dashboard/StudentProgramsOverview";
import { AcademyShell } from "@/components/layout/academy-shell";
import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { getAcademyProgram } from "@/lib/academy";
import { academyProductSlug } from "@/lib/academy-product";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { LearningWorkflowService } from "@/lib/services/learning-workflow.service";
import { MentorshipSchedulingService } from "@/lib/services/mentorship-scheduling.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProgressProvider } from "@/providers/ProgressProvider";

type DashboardMentorshipState =
  | "eligible"
  | "reserved"
  | "completed"
  | "preparation";

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
  const academyProduct = academyAccess.activeProducts.find(
    (product) => product.productSlug === academyProductSlug,
  );
  const session101Workflow = academyProduct
    ? await LearningWorkflowService.evaluateStudentWorkflow(
        profile.id,
        academyProduct.productId,
        supabase,
      )
    : null;
  const mentorshipBookings = academyProduct
    ? await MentorshipSchedulingService.listStudentBookings(profile.id, supabase)
    : [];
  const academyMentorshipBookings = academyProduct
    ? mentorshipBookings.filter(
        (booking) => booking.productId === academyProduct.productId,
      )
    : [];
  const mentorshipState: DashboardMentorshipState =
    academyMentorshipBookings.some((booking) => booking.status === "completed")
      ? "completed"
      : academyMentorshipBookings.some(
            (booking) => booking.status === "confirmed",
          )
        ? "reserved"
        : session101Workflow?.requirementsSatisfied
          ? "eligible"
          : "preparation";

  return (
    <AcademyShell>
      <ProgressProvider
        course={course}
        productSlug={academyProductSlug}
        programId={course.id}
      >
        <StudentDashboard
          activeProducts={academyAccess.activeProducts}
          mentorshipState={mentorshipState}
          session101Unlocked={Boolean(session101Workflow?.requirementsSatisfied)}
        />
      </ProgressProvider>
    </AcademyShell>
  );
}
