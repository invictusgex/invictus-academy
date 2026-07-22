"use client";

import { useState } from "react";

import { ScenarioLibraryService } from "@/lib/services/scenario-library.service";
import type {
  AdminScenario,
  AdminScenarioStatusAction,
} from "@/lib/types/scenario-library.types";

type AdminScenarioStatusActionsProps = {
  onUpdated: (scenario: AdminScenario) => void;
  scenario: AdminScenario;
};

export function AdminScenarioStatusActions({
  onUpdated,
  scenario,
}: AdminScenarioStatusActionsProps) {
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);

  async function applyAction(action: AdminScenarioStatusAction) {
    if (isSaving) {
      return;
    }

    setError("");
    setIsSaving(true);
    const result = await ScenarioLibraryService.updateScenarioStatus(
      scenario.id,
      action,
    );

    if (result.ok) {
      setIsConfirmingArchive(false);
      onUpdated(result.scenario);
    } else {
      setError(
        result.errors[0]?.message ??
          "No fue posible actualizar el estado del escenario.",
      );
    }

    setIsSaving(false);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5">
      <h2 className="text-lg font-semibold text-white">
        Acciones administrativas
      </h2>
      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-3">
        {scenario.status === "draft" ? (
          <button
            className="min-h-10 rounded-full bg-[var(--color-cyan)] px-4 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={() => applyAction("publish")}
            type="button"
          >
            {isSaving ? "Guardando..." : "Publicar"}
          </button>
        ) : null}

        {scenario.status === "published" ? (
          <button
            className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={() => applyAction("return_to_draft")}
            type="button"
          >
            {isSaving ? "Guardando..." : "Volver a borrador"}
          </button>
        ) : null}

        {scenario.status !== "archived" && !isConfirmingArchive ? (
          <button
            className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={() =>
              scenario.status === "published"
                ? setIsConfirmingArchive(true)
                : applyAction("archive")
            }
            type="button"
          >
            Archivar
          </button>
        ) : null}
      </div>

      {isConfirmingArchive ? (
        <div className="mt-4 rounded-xl border border-red-200/40 bg-[var(--color-card-bg)] p-4">
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            Archivar un escenario publicado lo retirara de la vista de alumnos.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="min-h-10 rounded-full bg-red-200 px-4 text-sm font-semibold text-[var(--color-page-bg)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              onClick={() => applyAction("archive")}
              type="button"
            >
              {isSaving ? "Archivando..." : "Confirmar archivado"}
            </button>
            <button
              className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)]"
              disabled={isSaving}
              onClick={() => setIsConfirmingArchive(false)}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
