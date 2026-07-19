"use client";

import Link from "next/link";

import { ProgressBar } from "@/components/ui/progress-bar";
import type { Course } from "@/types/academy";
import { useAcademyProgress } from "@/hooks/use-academy-progress";
import { formatModuleProgressStatusLabel } from "@/utils/module-progress";

type DashboardProgressCenterProps = {
  course: Course;
};

export function DashboardProgressCenter({
  course,
}: DashboardProgressCenterProps) {
  const { getModuleSummary, nextPendingSession, programSummary } =
    useAcademyProgress({
      course,
      programId: course.id,
    });
  const totalSessions = course.modules.reduce(
    (total, academyModule) => total + academyModule.videos.length,
    0,
  );
  const summary = programSummary ?? {
    completedSessions: 0,
    moduleCount: course.modules.length,
    pendingSessions: totalSessions,
    percentage: 0,
    totalSessions,
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Progreso general
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {summary.percentage} % del programa
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              {summary.completedSessions} de {summary.totalSessions} sesiones
              completadas.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[28rem]">
            <span className="rounded-xl border border-[var(--color-border)] p-3 text-[var(--color-text-secondary)]">
              <strong className="block text-lg text-white">
                {summary.moduleCount}
              </strong>
              módulos
            </span>
            <span className="rounded-xl border border-[var(--color-border)] p-3 text-[var(--color-text-secondary)]">
              <strong className="block text-lg text-white">
                {summary.totalSessions}
              </strong>
              sesiones
            </span>
            <span className="rounded-xl border border-[var(--color-border)] p-3 text-[var(--color-text-secondary)]">
              <strong className="block text-lg text-white">
                {summary.completedSessions}
              </strong>
              completadas
            </span>
            <span className="rounded-xl border border-[var(--color-border)] p-3 text-[var(--color-text-secondary)]">
              <strong className="block text-lg text-white">
                {summary.pendingSessions}
              </strong>
              pendientes
            </span>
          </div>
        </div>
        <div className="mt-6">
          <ProgressBar
            label="Progreso total del programa"
            value={summary.percentage}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Continuar formación
        </p>
        {nextPendingSession ? (
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-muted)]">
                Módulo {nextPendingSession.module.number} · Sesión{" "}
                {nextPendingSession.sessionNumber}
              </p>
              <h2 className="mt-3 break-words text-2xl font-semibold text-white">
                {nextPendingSession.video.title}
              </h2>
            </div>
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-center text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
              href={nextPendingSession.href}
            >
              Continuar formación
            </Link>
          </div>
        ) : (
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Programa completado
          </h2>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Estado por módulo
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {course.modules.map((academyModule) => {
            const moduleSummary = getModuleSummary(academyModule);
            const hasMultipleSessions = moduleSummary.totalSessions > 1;

            return (
              <article
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5"
                key={academyModule.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                      Módulo {academyModule.number}
                    </p>
                    <h3 className="mt-2 break-words text-lg font-semibold text-white">
                      {academyModule.title}
                    </h3>
                  </div>
                  <span className="w-fit rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-cyan)]">
                    {formatModuleProgressStatusLabel(moduleSummary.status)}
                  </span>
                </div>
                {hasMultipleSessions ? (
                  <div className="mt-5">
                    <ProgressBar
                      label={`${moduleSummary.completedSessions} de ${moduleSummary.totalSessions} sesiones completadas`}
                      value={moduleSummary.percentage}
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
