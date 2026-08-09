import { AcademyEnrollmentEmptyState } from "@/components/academy/AcademyEnrollmentEmptyState";
import { MentorshipPreparationPage } from "@/components/academy/mentorship/MentorshipPreparationPage";
import { AcademyShell } from "@/components/layout/academy-shell";
import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { academyProductSlug } from "@/lib/academy-product";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { MentorshipOutcomeService } from "@/lib/services/mentorship-outcome.service";
import { MentorshipPreparationService } from "@/lib/services/mentorship-preparation.service";
import { MentorshipSchedulingService } from "@/lib/services/mentorship-scheduling.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AcademyMentorshipPage() {
  const { profile } = await requireAcademyAuthContext();
  const supabase = await createSupabaseServerClient();
  const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);
  const academyProduct = academyAccess.activeProducts.find(
    (product) => product.productSlug === academyProductSlug,
  );

  if (!academyProduct) {
    return (
      <AcademyShell>
        <AcademyEnrollmentEmptyState />
      </AcademyShell>
    );
  }

  const preparation = await MentorshipPreparationService.getStudentPreparation(
    {
      productId: academyProduct.productId,
      profileId: profile.id,
    },
    supabase,
  );
  const [bookings, outcomes] = await Promise.all([
    MentorshipSchedulingService.listStudentBookings(profile.id, supabase),
    MentorshipOutcomeService.listSharedOutcomesByProfile(profile.id, supabase),
  ]);
  const academyBookings = bookings.filter(
    (booking) => booking.productId === academyProduct.productId,
  );
  const academyBookingIds = new Set(
    academyBookings.map((booking) => booking.id),
  );
  const academyOutcomes = outcomes.filter((outcome) =>
    academyBookingIds.has(outcome.bookingId),
  );
  const slots = preparation.requirementsSatisfied
    ? await MentorshipSchedulingService.listAvailableSlots(supabase)
    : [];

  return (
    <AcademyShell>
      <MentorshipPreparationPage
        bookings={academyBookings}
        outcomes={academyOutcomes}
        preparation={preparation}
        slots={slots}
      />
    </AcademyShell>
  );
}
