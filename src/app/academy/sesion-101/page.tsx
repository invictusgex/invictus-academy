import { AcademyShell } from "@/components/layout/academy-shell";
import { Session101AccessPage } from "@/components/academy/session-101/Session101AccessPage";
import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { academyProductSlug } from "@/lib/academy-product";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { LearningWorkflowService } from "@/lib/services/learning-workflow.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Session101Page() {
  const { profile } = await requireAcademyAuthContext();
  const supabase = await createSupabaseServerClient();
  const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);
  const activeProduct = academyAccess.activeProducts.find(
    (product) => product.productSlug === academyProductSlug,
  );
  const fallbackProduct = activeProduct
    ? null
    : await ProductRepository.getBySlug(supabase, academyProductSlug);
  const productId = activeProduct?.productId ?? fallbackProduct?.id ?? null;
  const workflow = productId
    ? await LearningWorkflowService.evaluateStudentWorkflow(
        profile.id,
        productId,
        supabase,
      )
    : null;

  return (
    <AcademyShell>
      <Session101AccessPage workflow={workflow} />
    </AcademyShell>
  );
}
