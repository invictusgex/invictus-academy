"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ScenarioLibraryService } from "@/lib/services/scenario-library.service";
import type { AdminScenario } from "@/lib/types/scenario-library.types";

type AdminScenarioDeleteConfirmationProps = {
  scenario: AdminScenario;
};

export function AdminScenarioDeleteConfirmation({
  scenario,
}: AdminScenarioDeleteConfirmationProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const canDelete = scenario.status === "draft" || scenario.status === "archived";

  async function deleteScenario() {
    if (isDeleting || !canDelete) {
      return;
    }

    setError("");
    setIsDeleting(true);
    const result = await ScenarioLibraryService.deleteScenario(scenario.id);

    if (result.ok) {
      router.push("/admin/scenarios");
    } else {
      setError(
        result.errors[0]?.message ?? "No fue posible eliminar el escenario.",
      );
      setIsDeleting(false);
    }
  }

  if (!canDelete) {
    return (
      <p className="text-sm text-[var(--color-text-secondary)]">
        Los escenarios publicados no se pueden eliminar. Primero vuelve a
        borrador o archiva el escenario.
      </p>
    );
  }

  if (!isConfirming) {
    return (
      <button
        className="min-h-10 rounded-full border border-red-200/50 px-4 text-sm font-semibold text-red-200 transition hover:bg-red-200 hover:text-[var(--color-page-bg)]"
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        Eliminar
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200/40 bg-[var(--color-card-bg)] p-4">
      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
        Esta accion es irreversible. El escenario sera eliminado de la
        biblioteca administrativa.
      </p>
      {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="min-h-10 rounded-full bg-red-200 px-4 text-sm font-semibold text-[var(--color-page-bg)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDeleting}
          onClick={deleteScenario}
          type="button"
        >
          {isDeleting ? "Eliminando..." : "Confirmar eliminacion"}
        </button>
        <button
          className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)]"
          disabled={isDeleting}
          onClick={() => setIsConfirming(false)}
          type="button"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
