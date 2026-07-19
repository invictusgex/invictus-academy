"use client";

import Link from "next/link";

import type { Module } from "@/types/academy";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useAcademyProgress } from "@/hooks/use-academy-progress";
import { formatModuleProgressStatusLabel } from "@/utils/module-progress";

type ModuleProgramCardProps = {
  module: Module;
  programId: string;
};

export function ModuleProgramCard({ module, programId }: ModuleProgramCardProps) {
  const { getModuleSummary } = useAcademyProgress({ programId });
  const moduleSummary = getModuleSummary(module);
  const hasMultipleSessions = moduleSummary.totalSessions > 1;

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Módulo {module.number}
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white">
            {module.title}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            {module.overview}
          </p>
        </div>
        <span className="w-fit rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-cyan)]">
          {formatModuleProgressStatusLabel(moduleSummary.status)}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="font-semibold text-white">Competencias:</span>{" "}
            {module.learningObjectives.length}
          </p>
          {hasMultipleSessions ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              {moduleSummary.completedSessions} de {moduleSummary.totalSessions}{" "}
              sesiones completadas
            </p>
          ) : null}
        </div>
        <Link
          href={`/academy/programa/${module.id}`}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        >
          Ingresar al módulo
        </Link>
      </div>
      {hasMultipleSessions ? (
        <div className="mt-5">
          <ProgressBar
            label="Progreso del módulo"
            value={moduleSummary.percentage}
          />
        </div>
      ) : null}
    </article>
  );
}
