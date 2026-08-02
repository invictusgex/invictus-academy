"use client";

import { useState } from "react";

import { StudentCard, StudentStatusBadge } from "@/components/student";
import { useProgressContext } from "@/contexts/ProgressContext";
import type { ModuleProgressStatus } from "@/utils/module-progress";

type ModuleCompletionPanelProps = {
  moduleId: string;
  status: ModuleProgressStatus;
};

export function ModuleCompletionPanel({
  moduleId,
  status,
}: ModuleCompletionPanelProps) {
  const { markModuleCompleted } = useProgressContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const completed = status === "completed";

  async function handleCompleteModule() {
    if (completed || saving) {
      return;
    }

    setSaving(true);
    setError(false);

    try {
      await markModuleCompleted(moduleId);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <StudentCard elevated>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
              Progreso del módulo
            </p>
            <StudentStatusBadge tone={completed ? "complete" : "neutral"}>
              {completed ? "Completado" : "Pendiente"}
            </StudentStatusBadge>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Marca este módulo como completado cuando hayas revisado su contenido
            y estes listo para avanzar.
          </p>
          {error ? (
            <p className="mt-3 text-sm font-medium text-amber-100">
              No pudimos actualizar tu progreso. Intenta nuevamente.
            </p>
          ) : null}
        </div>

        <button
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          disabled={completed || saving}
          onClick={handleCompleteModule}
          type="button"
        >
          {completed
            ? "Módulo completado"
            : saving
              ? "Guardando..."
              : "Marcar módulo completado"}
        </button>
      </div>
    </StudentCard>
  );
}
