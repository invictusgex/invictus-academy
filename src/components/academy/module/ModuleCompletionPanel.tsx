"use client";

import Link from "next/link";
import { useState } from "react";

import { StudentCard, StudentStatusBadge } from "@/components/student";
import { useProgressContext } from "@/contexts/ProgressContext";
import type { ModuleProgressStatus } from "@/utils/module-progress";

type ModuleCompletionPanelProps = {
  moduleId: string;
  nextModule?: {
    id: string;
    title: string;
  };
  status: ModuleProgressStatus;
};

export function ModuleCompletionPanel({
  moduleId,
  nextModule,
  status,
}: ModuleCompletionPanelProps) {
  const { markModuleCompleted } = useProgressContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const completed = status === "completed";
  const completedFinalModule = completed && !nextModule;

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
              Estado de la etapa
            </p>
            <StudentStatusBadge tone={completed ? "complete" : "neutral"}>
              {completed ? "Completada" : "Pendiente"}
            </StudentStatusBadge>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Completa esta etapa cuando hayas integrado su objetivo y estés
            listo para avanzar en tu recorrido.
          </p>
          {error ? (
            <p className="mt-3 text-sm font-medium text-amber-100">
              No pudimos actualizar tu progreso. Intenta nuevamente.
            </p>
          ) : null}
        </div>

        {completed ? (
          nextModule ? (
            <Link
              aria-label={`Continuar a la siguiente etapa: ${nextModule.title}`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-fit motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              href={`/academy/programa/${nextModule.id}`}
            >
              Continuar a la siguiente etapa
            </Link>
          ) : (
            <p className="text-sm font-semibold text-[var(--color-cyan)]">
              Etapa completada
            </p>
          )
        ) : (
          <button
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            disabled={saving}
            onClick={handleCompleteModule}
            type="button"
          >
            {saving ? "Guardando..." : "Completar esta etapa"}
          </button>
        )}
      </div>

      {completedFinalModule ? (
        <div className="mt-8 rounded-2xl border border-cyan-200/25 bg-cyan-200/[0.04] p-5 sm:p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Formación completada
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            Has completado tu recorrido de formación
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base sm:leading-7">
            Has finalizado las 7 etapas del Programa de Formación y tu recorrido
            ha quedado documentado en tu expediente.
          </p>
          <p className="mt-5 text-base font-semibold text-white">
            Tu siguiente etapa es la mentoría privada en vivo 1 a 1.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base sm:leading-7">
            Tu mentor revisará previamente tu progreso, reflexiones y material
            adjunto para preparar una sesión centrada en profundizar, integrar y
            consolidar la metodología.
          </p>
          <Link
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-fit motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            href="/academy/mentoria"
          >
            Continuar a mi mentoría
          </Link>
        </div>
      ) : null}
    </StudentCard>
  );
}
