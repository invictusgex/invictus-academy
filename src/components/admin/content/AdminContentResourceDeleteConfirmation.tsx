import { useState } from "react";

import { AdminContentService } from "@/lib/services/admin-content.service";
import type { AdminContentModule } from "@/lib/types/admin-content.types";

type AdminContentResourceDeleteConfirmationProps = {
  moduleId: string;
  onUpdated: (module: AdminContentModule) => void;
  resourceId: string;
  resourceTitle: string;
};

export function AdminContentResourceDeleteConfirmation({
  moduleId,
  onUpdated,
  resourceId,
  resourceTitle,
}: AdminContentResourceDeleteConfirmationProps) {
  const [error, setError] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteResource() {
    if (isDeleting) {
      return;
    }

    setError("");
    setIsDeleting(true);
    const result = await AdminContentService.deleteResource(moduleId, resourceId);

    if (result.ok) {
      setIsConfirming(false);
      onUpdated(result.module);
    } else {
      setError(
        result.errors[0]?.message ?? "No fue posible eliminar el recurso.",
      );
    }

    setIsDeleting(false);
  }

  if (!isConfirming) {
    return (
      <button
        className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-red-200"
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
        Confirma la eliminacion de {resourceTitle}. Esta accion no elimina el
        modulo ni modifica el progreso registrado.
      </p>
      {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="min-h-10 rounded-full bg-red-200 px-4 text-sm font-semibold text-[var(--color-page-bg)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDeleting}
          onClick={deleteResource}
          type="button"
        >
          {isDeleting ? "Eliminando..." : "Confirmar eliminacion"}
        </button>
        <button
          className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-60"
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
