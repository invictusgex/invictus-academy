import Link from "next/link";

import {
  StudentCard,
  StudentStatusBadge,
} from "@/components/student";
import type { ActiveEnrollmentProduct } from "@/lib/types/enrollment.types";

type ProgramProgressSummary = {
  completedModules: number;
  percentage: number;
  statusLabel: string;
  totalModules: number;
};

type StudentEnrollmentProgramCardProps = {
  ctaHref: string;
  product: ActiveEnrollmentProduct;
  progress: ProgramProgressSummary | null;
};

export function StudentEnrollmentProgramCard({
  ctaHref,
  product,
  progress,
}: StudentEnrollmentProgramCardProps) {
  return (
    <StudentCard className="h-full" elevated>
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
              Programa activo
            </p>
            <h3 className="mt-2 break-words text-xl font-semibold text-white">
              {product.productTitle}
            </h3>
          </div>
          <StudentStatusBadge tone="complete">Acceso activo</StudentStatusBadge>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          {product.productDescription ??
            "Formación disponible en tu espacio privado."}
        </p>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
          {progress ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">
                  {progress.statusLabel}
                </p>
                <p className="text-sm font-semibold text-[var(--color-cyan)]">
                  {progress.percentage}%
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[var(--color-cyan)]"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
                {progress.completedModules}/{progress.totalModules} módulos
                completados
              </p>
            </>
          ) : (
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              El progreso detallado estara disponible cuando este programa tenga
              una ruta privada dedicada.
            </p>
          )}
        </div>

        <Link
          className="mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-fit motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          href={ctaHref}
        >
          Continuar formación
        </Link>
      </div>
    </StudentCard>
  );
}
