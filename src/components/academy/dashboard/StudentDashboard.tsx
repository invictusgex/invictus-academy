"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  ContinueModuleCard,
} from "@/components/academy/dashboard/ContinueModuleCard";
import { StudentModuleCard } from "@/components/academy/dashboard/StudentModuleCard";
import { StudentProgressSummary } from "@/components/academy/dashboard/StudentProgressSummary";
import { StudentScenarioCard } from "@/components/academy/dashboard/StudentScenarioCard";
import {
  getAccessibleModules,
  getCurrentModuleSummary,
  getProgressPercentage,
  getProgramStatusLabel,
  getStudentGreeting,
  getStudentNameFromEmail,
  toStudentModuleStatus,
  type StudentModuleSummary,
} from "@/components/academy/dashboard/student-dashboard-utils";
import { useModuleThumbnailUrls } from "@/components/academy/dashboard/useModuleThumbnailUrls";
import { useRecentPublishedScenarios } from "@/components/academy/dashboard/useRecentPublishedScenarios";
import {
  StudentActionCard,
  StudentContentGrid,
  StudentEmptyState,
  StudentLoadingSkeleton,
  StudentSection,
  StudentStatCard,
  StudentWelcomeHero,
} from "@/components/student";
import { useProgressContext } from "@/contexts/ProgressContext";
import { useAuth } from "@/hooks/useAuth";
import type { Course } from "@/types/academy";
import {
  formatModuleProgressStatusLabel,
} from "@/utils/module-progress";

type StudentDashboardProps = {
  course: Course;
};

function getHeroCta({
  continueModule,
  completedModules,
  totalModules,
}: {
  continueModule: StudentModuleSummary | null;
  completedModules: number;
  totalModules: number;
}) {
  if (totalModules > 0 && completedModules >= totalModules) {
    return {
      href: "/academy/programa",
      label: "Revisar programa",
    };
  }

  if (continueModule) {
    if (continueModule.status === "not-started") {
      return {
        href: "/academy/programa",
        label: "Ver programa",
      };
    }

    return {
      href: `/academy/programa/${continueModule.academyModule.id}`,
      label: "Continuar formacion",
    };
  }

  return {
    href: "/academy/programa",
    label: "Ver programa",
  };
}

function getVisibleModules({
  continueModule,
  modules,
}: {
  continueModule: StudentModuleSummary | null;
  modules: StudentModuleSummary[];
}) {
  if (!continueModule) {
    return modules.slice(0, 4);
  }

  const startIndex = Math.max(
    modules.findIndex(
      (moduleSummary) =>
        moduleSummary.academyModule.id === continueModule.academyModule.id,
    ),
    0,
  );

  return modules.slice(startIndex, startIndex + 4);
}

export function StudentDashboard({ course }: StudentDashboardProps) {
  const { user } = useAuth();
  const {
    getPersistedModuleStatus,
    loading: progressLoading,
  } = useProgressContext();
  const [greeting, setGreeting] = useState("Bienvenido");
  const {
    error: scenarioError,
    loading: scenariosLoading,
    scenarios: recentScenarios,
  } = useRecentPublishedScenarios(3);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setGreeting(getStudentGreeting());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

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

  const completedModules = moduleSummaries.filter(
    (moduleSummary) => moduleSummary.status === "completed",
  ).length;
  const totalModules = moduleSummaries.length;
  const progressPercentage = getProgressPercentage(completedModules, totalModules);
  const programStatusLabel = getProgramStatusLabel({
    completedModules,
    totalModules,
  });
  const continueModule = useMemo(
    () => getCurrentModuleSummary(moduleSummaries),
    [moduleSummaries],
  );
  const visibleModules = useMemo(
    () =>
      getVisibleModules({
        continueModule,
        modules: moduleSummaries,
      }),
    [continueModule, moduleSummaries],
  );
  const visibleModuleThumbnailInputs = useMemo(
    () =>
      visibleModules
        .map((moduleSummary) => ({
          id: moduleSummary.academyModule.id,
          thumbnailUrl: moduleSummary.academyModule.thumbnailUrl ?? null,
        }))
        .filter(({ thumbnailUrl }) => thumbnailUrl),
    [visibleModules],
  );

  const moduleThumbnailUrls = useModuleThumbnailUrls(
    visibleModuleThumbnailInputs,
  );
  const displayVisibleModules = useMemo(
    () =>
      visibleModules.map((moduleSummary) => ({
        ...moduleSummary,
        academyModule: {
          ...moduleSummary.academyModule,
          thumbnailUrl: moduleThumbnailUrls[moduleSummary.academyModule.id] ?? null,
        },
      })),
    [moduleThumbnailUrls, visibleModules],
  );
  const displayContinueModule =
    displayVisibleModules.find(
      (moduleSummary) =>
        moduleSummary.academyModule.id === continueModule?.academyModule.id,
    ) ?? null;
  const heroCta = getHeroCta({
    completedModules,
    continueModule,
    totalModules,
  });
  const studentName = getStudentNameFromEmail(user?.email);

  return (
    <div className="space-y-6">
      <StudentWelcomeHero
        badge={programStatusLabel}
        ctaHref={heroCta.href}
        ctaLabel={heroCta.label}
        description="La disciplina construye consistencia. La consistencia construye resultados."
        greeting={greeting}
        name={studentName}
      />

      <StudentSection
        description="Retoma el modulo que corresponde segun tu progreso actual."
        title="Continuar formacion"
      >
        {progressLoading ? (
          <StudentLoadingSkeleton columns={2} rows={1} />
        ) : displayContinueModule ? (
          <ContinueModuleCard
            academyModule={displayContinueModule.academyModule}
            ctaLabel={
              displayContinueModule.status === "not-started"
                ? "Comenzar modulo"
                : "Continuar modulo"
            }
            status={displayContinueModule.status}
            statusLabel={displayContinueModule.statusLabel}
          />
        ) : totalModules > 0 ? (
          <StudentEmptyState
            actionHref="/academy/programa"
            actionLabel="Revisar programa"
            title="Programa completado"
          >
            Completaste los modulos disponibles. Puedes volver al programa para
            repasar tu proceso cuando lo necesites.
          </StudentEmptyState>
        ) : (
          <StudentEmptyState title="Tu formacion aun no tiene modulos disponibles">
            Los modulos publicados apareceran aqui cuando esten listos.
          </StudentEmptyState>
        )}
      </StudentSection>

      <StudentSection
        description="Una lectura clara de tu posicion actual dentro del programa."
        title="Resumen del programa"
      >
        {progressLoading ? (
          <StudentLoadingSkeleton columns={3} rows={3} />
        ) : (
          <div className="space-y-4">
            <StudentProgressSummary
              completedModules={completedModules}
              percentage={progressPercentage}
              statusLabel={programStatusLabel}
              totalModules={totalModules}
            />
            <StudentContentGrid columns={3}>
              <StudentStatCard
                caption={`${totalModules} modulos disponibles`}
                label="Modulos completados"
                value={`${completedModules}/${totalModules}`}
              />
              {!scenarioError ? (
                <StudentStatCard
                  caption="Escenarios publicados visibles para tu cuenta"
                  label="Escenarios recientes"
                  value={
                    scenariosLoading ? "..." : String(recentScenarios.length)
                  }
                />
              ) : null}
            </StudentContentGrid>
          </div>
        )}
      </StudentSection>

      <StudentSection
        actions={
          <Link
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            href="/academy/programa"
          >
            Ver programa completo
          </Link>
        }
        description="Vista compacta de los modulos disponibles en orden academico."
        title="Programa"
      >
        {progressLoading ? (
          <StudentLoadingSkeleton columns={4} rows={4} />
        ) : displayVisibleModules.length > 0 ? (
          <StudentContentGrid columns={4}>
            {displayVisibleModules.map((moduleSummary) => (
              <StudentModuleCard
                academyModule={moduleSummary.academyModule}
                key={moduleSummary.academyModule.id}
                status={moduleSummary.status}
                statusLabel={moduleSummary.statusLabel}
              />
            ))}
          </StudentContentGrid>
        ) : (
          <StudentEmptyState title="No hay modulos disponibles">
            Tu formacion esta lista para comenzar cuando existan modulos
            publicados para tu acceso.
          </StudentEmptyState>
        )}
      </StudentSection>

      <StudentSection
        actions={
          <Link
            className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            href="/academy/escenarios"
          >
            Ver Biblioteca de Escenarios
          </Link>
        }
        description="Casos publicados para estudiar contexto, estructura y ejecucion."
        title="Escenarios recientes"
      >
        {scenariosLoading ? (
          <StudentLoadingSkeleton columns={3} rows={3} />
        ) : scenarioError ? (
          <StudentEmptyState title="No se pudieron cargar los escenarios">
            El resto del dashboard sigue disponible. Intenta volver a la
            biblioteca mas tarde.
          </StudentEmptyState>
        ) : recentScenarios.length > 0 ? (
          <StudentContentGrid columns={3}>
            {recentScenarios.map((scenario) => (
              <StudentScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </StudentContentGrid>
        ) : (
          <StudentEmptyState title="Todavia no hay escenarios publicados">
            Los nuevos casos de estudio apareceran aqui cuando esten
            disponibles.
          </StudentEmptyState>
        )}
      </StudentSection>

      <StudentSection
        description="Accesos directos a las areas activas del espacio privado."
        title="Accesos rapidos"
      >
        <StudentContentGrid columns={2}>
          <StudentActionCard
            badge="Programa"
            ctaHref="/academy/programa"
            ctaLabel="Ir al programa"
            title="Mi programa"
          >
            Revisa modulos, objetivos y recursos del programa principal.
          </StudentActionCard>
          <StudentActionCard
            badge="Escenarios"
            ctaHref="/academy/escenarios"
            ctaLabel="Abrir biblioteca"
            title="Biblioteca de Escenarios"
          >
            Consulta analisis y casos de estudio publicados para alumnos.
          </StudentActionCard>
        </StudentContentGrid>
      </StudentSection>
    </div>
  );
}
