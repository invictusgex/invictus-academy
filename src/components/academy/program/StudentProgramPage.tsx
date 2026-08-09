"use client";

import Link from "next/link";

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

function FormationCompletedTransition() {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Formación completada
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">
        Has completado tu recorrido de formación
      </h2>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
        Has finalizado las 7 etapas del Programa de Formación y tu recorrido ha
        quedado documentado en tu expediente.
      </p>
      <p className="mt-5 text-sm font-semibold text-white">
        Tu siguiente etapa es la mentoría privada en vivo 1 a 1.
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
        Tu mentor revisará previamente tu progreso, reflexiones y material
        adjunto para preparar una sesión centrada en profundizar, integrar y
        consolidar la metodología.
      </p>
      <Link
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        href="/academy/mentoria"
      >
        Continuar a mi mentoría
      </Link>
    </section>
  );
}

export function StudentProgramPage() {
  const { loading: progressLoading, progress } = useProgressContext();
  const displayCurrentModule =
    progress.modules.find(
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
              <FormationCompletedTransition />
            )}
          </StudentSection>

          <StudentSection
            description="Recorre la secuencia completa del programa en orden académico."
            title="Etapas del programa"
          >
            <div className="grid gap-4">
              {progress.modules.map((moduleSummary) => (
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
