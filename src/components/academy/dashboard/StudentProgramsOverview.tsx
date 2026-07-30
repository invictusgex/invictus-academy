import { StudentEnrollmentProgramCard } from "@/components/academy/dashboard/StudentEnrollmentProgramCard";
import {
  StudentContentGrid,
  StudentSection,
} from "@/components/student";
import { academyProductSlug } from "@/lib/academy-product";
import type { ActiveEnrollmentProduct } from "@/lib/types/enrollment.types";

type ProgramProgressSummary = {
  completedModules: number;
  percentage: number;
  statusLabel: string;
  totalModules: number;
};

type StudentProgramsOverviewProps = {
  activeProducts: ActiveEnrollmentProduct[];
  academyProgress?: ProgramProgressSummary;
};

function getProgramHref(product: ActiveEnrollmentProduct) {
  if (product.productSlug === academyProductSlug) {
    return "/academy/programa";
  }

  return "/academy/programa";
}

export function StudentProgramsOverview({
  academyProgress,
  activeProducts,
}: StudentProgramsOverviewProps) {
  return (
    <StudentSection
      description="Programas concedidos por tus accesos activos."
      title="Mis programas"
    >
      <StudentContentGrid columns={3}>
        {activeProducts.map((product) => (
          <StudentEnrollmentProgramCard
            ctaHref={getProgramHref(product)}
            key={product.enrollmentId}
            product={product}
            progress={
              product.productSlug === academyProductSlug
                ? academyProgress ?? null
                : null
            }
          />
        ))}
      </StudentContentGrid>
    </StudentSection>
  );
}
