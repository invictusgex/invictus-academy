import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { academyProductSlug } from "@/lib/academy-product";
import { getActiveEnrollmentProducts } from "@/lib/services/enrollment.service";
import type { Database } from "@/lib/supabase/database.types";
import type { ActiveEnrollmentProduct } from "@/lib/types/enrollment.types";

export type AcademyEnrollmentAccess = {
  activeProducts: ActiveEnrollmentProduct[];
  hasAcademyProgramAccess: boolean;
  hasAnyActiveEnrollment: boolean;
};

export async function getAcademyEnrollmentAccess(
  profileId: string,
  supabase: SupabaseClient<Database>,
): Promise<AcademyEnrollmentAccess> {
  const activeProducts = await getActiveEnrollmentProducts(profileId, supabase);

  return {
    activeProducts,
    hasAcademyProgramAccess: activeProducts.some(
      (product) => product.productSlug === academyProductSlug,
    ),
    hasAnyActiveEnrollment: activeProducts.length > 0,
  };
}
