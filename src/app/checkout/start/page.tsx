import { redirect } from "next/navigation";

import { CheckoutStartPage } from "@/components/checkout/CheckoutStartPage";
import { formationCtaHref } from "@/config/public-cta";
import { getCurrentServerUser } from "@/lib/auth/server";
import { academyProductSlug } from "@/lib/academy-product";
import { ProfileRepository } from "@/lib/repositories/profile.repository";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { CommercialPromotionService } from "@/lib/services/commercial-promotion.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CheckoutStartRoute() {
  const user = await getCurrentServerUser();

  if (!user) {
    redirect(`/registro?next=${encodeURIComponent(formationCtaHref)}`);
  }

  const supabase = await createSupabaseServerClient();
  const profile = await ProfileRepository.getById(supabase, user.id);

  if (profile) {
    const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);

    if (academyAccess.hasAcademyProgramAccess) {
      redirect("/academy");
    }
  }

  const promotion = await CommercialPromotionService.getActivePromotion();

  return (
    <CheckoutStartPage
      productSlug={academyProductSlug}
      promotion={promotion}
    />
  );
}
