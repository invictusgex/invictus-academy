import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getActiveEnrollmentProducts } from "@/lib/services/enrollment.service";
import type { Database } from "@/lib/supabase/database.types";
import type { ActiveEnrollmentProduct } from "@/lib/types/enrollment.types";

export const academyProductSlug = "trading-basado-en-datos";

export type AcademyEnrollmentAccess = {
  activeProducts: ActiveEnrollmentProduct[];
  hasAccess: boolean;
};

export async function getAcademyEnrollmentAccess(
  profileId: string,
  supabase: SupabaseClient<Database>,
): Promise<AcademyEnrollmentAccess> {
  const activeProducts = await getActiveEnrollmentProducts(profileId, supabase);

  return {
    activeProducts,
    hasAccess: activeProducts.some(
      (product) => product.productSlug === academyProductSlug,
    ),
  };
}
