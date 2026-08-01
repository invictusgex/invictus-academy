import { AcademyEnrollmentEmptyState } from "@/components/academy/AcademyEnrollmentEmptyState";
import { MentorshipPreparationPage } from "@/components/academy/mentorship/MentorshipPreparationPage";
import { AcademyShell } from "@/components/layout/academy-shell";
import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { academyProductSlug } from "@/lib/academy-product";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { MentorshipPreparationService } from "@/lib/services/mentorship-preparation.service";
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

  return (
    <AcademyShell>
      <MentorshipPreparationPage preparation={preparation} />
    </AcademyShell>
  );
}
