"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useModuleThumbnailUrls } from "@/components/academy/dashboard/useModuleThumbnailUrls";
import { CurrentProgramModuleCard } from "@/components/academy/program/CurrentProgramModuleCard";
import { StudentProgramModuleCard } from "@/components/academy/program/StudentProgramModuleCard";
import { StudentProgramOverview } from "@/components/academy/program/StudentProgramOverview";
import {
  StudentEmptyState,
  StudentLoadingSkeleton,
  StudentPageHeader,
  StudentSection,
} from "@/components/student";
import { useProgressContext } from "@/contexts/ProgressContext";
import type { ProgramModuleProgress } from "@/utils/module-progress";

function getModuleCtaLabel(status: ProgramModuleProgress["status"]) {
  if (status === "completed") {
    return "Revisar etapa";
  }

  if (status === "in-progress") {
    return "Continuar etapa";
  }

  return "Comenzar etapa";
}

export function StudentProgramPage() {
  const { loading: progressLoading, progress } = useProgressContext();
  const moduleThumbnailInputs = useMemo(
    () =>
      progress.modules
        .map((moduleSummary) => ({
          id: moduleSummary.academyModule.id,
          thumbnailUrl: moduleSummary.academyModule.thumbnailUrl ?? null,
        }))
        .filter(({ thumbnailUrl }) => thumbnailUrl),
    [progress.modules],
  );
  const moduleThumbnailUrls = useModuleThumbnailUrls(moduleThumbnailInputs);
  const displayModuleSummaries = useMemo(
    () =>
      progress.modules.map((moduleSummary) => ({
        ...moduleSummary,
        academyModule: {
          ...moduleSummary.academyModule,
          thumbnailUrl: moduleThumbnailUrls[moduleSummary.academyModule.id] ?? null,
        },
      })),
    [progress.modules, moduleThumbnailUrls],
  );
  const displayCurrentModule =
    displayModuleSummaries.find(
      (moduleSummary) =>
        moduleSummary.academyModule.id === progress.currentModule?.academyModule.id,
    ) ?? null;

  return (
    <div className="space-y-6">
      <StudentPageHeader
        actions={
          <Link
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            href="/academy"
          >
            Volver al Centro de Formación
          </Link>
        }
        eyebrow="Programa de formación"
        title="Programa"
      >
        Avanza por cada etapa y construye una metodología basada en datos,
        estructura y disciplina.
      </StudentPageHeader>

      {progressLoading ? (
        <StudentSection title="Resumen del avance">
          <StudentLoadingSkeleton columns={3} rows={3} />
        </StudentSection>
      ) : progress.totalModules > 0 ? (
        <>
          <StudentSection
            description="Tu avance se calcula por etapa completada, no por material o recursos."
            title="Resumen del avance"
          >
            <StudentProgramOverview
              completedModules={progress.completedModules}
              percentage={progress.percentage}
              statusLabel={progress.statusLabel}
              totalModules={progress.totalModules}
            />
          </StudentSection>

          <StudentSection
            description="La siguiente acción sugerida según tu progreso actual."
            title="Etapa actual"
          >
            {displayCurrentModule ? (
              <CurrentProgramModuleCard
                academyModule={displayCurrentModule.academyModule}
                ctaLabel={getModuleCtaLabel(displayCurrentModule.status)}
                status={displayCurrentModule.status}
                statusLabel={displayCurrentModule.statusLabel}
              />
            ) : (
              <StudentEmptyState
                actionHref="/academy"
                actionLabel="Volver al Centro de Formación"
                title="Programa completado"
              >
                Completaste las etapas disponibles. Puedes volver a revisar
                cualquier etapa desde el listado.
              </StudentEmptyState>
            )}
          </StudentSection>

          <StudentSection
            description="Recorre la secuencia completa del programa en orden académico."
            title="Etapas del programa"
          >
            <div className="grid gap-4">
              {displayModuleSummaries.map((moduleSummary) => (
                <StudentProgramModuleCard
                  academyModule={moduleSummary.academyModule}
                  ctaLabel={getModuleCtaLabel(moduleSummary.status)}
                  key={moduleSummary.academyModule.id}
                  status={moduleSummary.status}
                  statusLabel={moduleSummary.statusLabel}
                />
              ))}
            </div>
          </StudentSection>
        </>
      ) : (
        <StudentEmptyState
          actionHref="/academy"
          actionLabel="Volver al Centro de Formación"
          title="Tu programa todavía no tiene etapas disponibles."
        >
          La formación aparecerá aquí cuando sea publicada.
        </StudentEmptyState>
      )}
    </div>
  );
}
