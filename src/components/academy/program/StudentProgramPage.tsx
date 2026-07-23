"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  getAccessibleModules,
  getCurrentModuleSummary,
  getProgressPercentage,
  getProgramStatusLabel,
  toStudentModuleStatus,
  type StudentModuleSummary,
} from "@/components/academy/dashboard/student-dashboard-utils";
import { useModuleThumbnailUrls } from "@/components/academy/dashboard/useModuleThumbnailUrls";
import { CurrentProgramModuleCard } from "@/components/academy/program/CurrentProgramModuleCard";
import { StudentProgramModuleCard } from "@/components/academy/program/StudentProgramModuleCard";
import { StudentProgramOverview } from "@/components/academy/program/StudentProgramOverview";
import {
  StudentEmptyState,
  StudentPageHeader,
  StudentSection,
  StudentLoadingSkeleton,
} from "@/components/student";
import { useProgressContext } from "@/contexts/ProgressContext";
import type { Course } from "@/types/academy";
import { formatModuleProgressStatusLabel } from "@/utils/module-progress";

type StudentProgramPageProps = {
  course: Course;
};

function getModuleCtaLabel(status: StudentModuleSummary["status"]) {
  if (status === "completed") {
    return "Revisar modulo";
  }

  if (status === "in-progress") {
    return "Continuar modulo";
  }

  return "Comenzar modulo";
}

export function StudentProgramPage({ course }: StudentProgramPageProps) {
  const {
    getPersistedModuleStatus,
    loading: progressLoading,
  } = useProgressContext();
  const accessibleModules = useMemo(
    () => getAccessibleModules(course.modules),
    [course.modules],
  );
  const moduleSummaries = useMemo<StudentModuleSummary[]>(
    () =>
      accessibleModules.map((academyModule) => {
        const status = toStudentModuleStatus(
          getPersistedModuleStatus(academyModule.id),
        );

        return {
          academyModule,
          status,
          statusLabel: formatModuleProgressStatusLabel(status),
        };
      }),
    [accessibleModules, getPersistedModuleStatus],
  );
  const currentModule = useMemo(
    () => getCurrentModuleSummary(moduleSummaries),
    [moduleSummaries],
  );
  const moduleThumbnailInputs = useMemo(
    () =>
      moduleSummaries
        .map((moduleSummary) => ({
          id: moduleSummary.academyModule.id,
          thumbnailUrl: moduleSummary.academyModule.thumbnailUrl ?? null,
        }))
        .filter(({ thumbnailUrl }) => thumbnailUrl),
    [moduleSummaries],
  );
  const moduleThumbnailUrls = useModuleThumbnailUrls(moduleThumbnailInputs);
  const displayModuleSummaries = useMemo(
    () =>
      moduleSummaries.map((moduleSummary) => ({
        ...moduleSummary,
        academyModule: {
          ...moduleSummary.academyModule,
          thumbnailUrl: moduleThumbnailUrls[moduleSummary.academyModule.id] ?? null,
        },
      })),
    [moduleSummaries, moduleThumbnailUrls],
  );
  const displayCurrentModule =
    displayModuleSummaries.find(
      (moduleSummary) =>
        moduleSummary.academyModule.id === currentModule?.academyModule.id,
    ) ?? null;
  const completedModules = moduleSummaries.filter(
    (moduleSummary) => moduleSummary.status === "completed",
  ).length;
  const totalModules = moduleSummaries.length;
  const progressPercentage = getProgressPercentage(completedModules, totalModules);
  const programStatusLabel = getProgramStatusLabel({
    completedModules,
    totalModules,
  });

  return (
    <div className="space-y-6">
      <StudentPageHeader
        actions={
          <Link
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            href="/academy"
          >
            Volver al dashboard
          </Link>
        }
        eyebrow="Programa de formacion"
        title="Programa"
      >
        Avanza por cada modulo y construye una metodologia basada en datos,
        estructura y disciplina.
      </StudentPageHeader>

      {progressLoading ? (
        <StudentSection title="Resumen del progreso">
          <StudentLoadingSkeleton columns={3} rows={3} />
        </StudentSection>
      ) : totalModules > 0 ? (
        <>
          <StudentSection
            description="Tu avance se calcula por modulo completado, no por videos ni recursos."
            title="Resumen del progreso"
          >
            <StudentProgramOverview
              completedModules={completedModules}
              percentage={progressPercentage}
              statusLabel={programStatusLabel}
              totalModules={totalModules}
            />
          </StudentSection>

          <StudentSection
            description="La siguiente accion sugerida segun tu progreso actual."
            title="Modulo actual"
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
                actionLabel="Volver al dashboard"
                title="Programa completado"
              >
                Completaste los modulos disponibles. Puedes volver a revisar
                cualquier modulo desde el listado.
              </StudentEmptyState>
            )}
          </StudentSection>

          <StudentSection
            description="Recorre la secuencia completa del programa en orden academico."
            title="Listado completo de modulos"
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
          actionLabel="Volver al dashboard"
          title="Tu programa todavia no tiene modulos disponibles."
        >
          El contenido aparecera aqui cuando sea publicado.
        </StudentEmptyState>
      )}
    </div>
  );
}
