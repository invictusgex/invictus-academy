"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminLoadingSkeleton } from "@/components/admin/ui/AdminLoadingSkeleton";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { AdminStatusMessage } from "@/components/admin/ui/AdminStatusMessage";
import {
  formatAvailability,
  formatContentStatus,
  formatDurationMinutes,
} from "@/components/admin/content/admin-content-formatters";
import { AdminContentService } from "@/lib/services/admin-content.service";
import type { AdminContentProgram } from "@/lib/types/admin-content.types";

type SummaryItem = {
  label: string;
  value: number;
};

function SummaryCard({ label, value }: SummaryItem) {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4">
      <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </article>
  );
}

export function AdminContentPage() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<AdminContentProgram | null>(null);

  useEffect(() => {
    let isActive = true;
    const timeoutId = window.setTimeout(() => {
      async function loadContent() {
        setError(false);
        setLoading(true);

        try {
          const content = await AdminContentService.getProgramContent();

          if (isActive) {
            setProgram(content);
          }
        } catch {
          if (isActive) {
            setError(true);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      void loadContent();
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const modules = program?.modules ?? [];
  const summaryItems = useMemo<SummaryItem[]>(() => {
    const summary = program?.summary;

    return [
      { label: "Modulos", value: summary?.moduleCount ?? 0 },
      { label: "Videos", value: summary?.videoCount ?? 0 },
      { label: "Recursos", value: summary?.resourceCount ?? 0 },
      { label: "Publicados", value: summary?.publishedModules ?? 0 },
      { label: "Borradores", value: summary?.draftModules ?? 0 },
      { label: "Archivados", value: summary?.archivedModules ?? 0 },
    ];
  }, [program]);

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Contenido" title="Contenido academico">
        Vista administrativa de modulos, videos y recursos existentes en el CMS
        academico.
      </AdminPageHeader>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white">Modulos</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {loading ? "Cargando contenido..." : `${modules.length} modulos`}
          </p>
        </div>

        {error ? (
          <div className="p-5">
            <AdminStatusMessage tone="error">
              No fue posible cargar el contenido administrativo.
            </AdminStatusMessage>
          </div>
        ) : null}

        {loading ? <AdminLoadingSkeleton rows={6} /> : null}

        {!error && !loading ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[62rem] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-card-bg)] text-xs tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="px-5 py-4 font-semibold">Orden</th>
                  <th className="px-5 py-4 font-semibold">Titulo</th>
                  <th className="px-5 py-4 font-semibold">Estado</th>
                  <th className="px-5 py-4 font-semibold">Duracion</th>
                  <th className="px-5 py-4 font-semibold">Videos</th>
                  <th className="px-5 py-4 font-semibold">Recursos</th>
                  <th className="px-5 py-4 font-semibold">Disponibilidad</th>
                  <th className="px-5 py-4 font-semibold">Accion</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((academyModule) => (
                  <tr
                    className="border-t border-[var(--color-border)]"
                    key={academyModule.id}
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      {academyModule.position}
                    </td>
                    <td className="px-5 py-4 font-medium text-white">
                      {academyModule.title}
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge>
                        {formatContentStatus(academyModule.status)}
                      </AdminStatusBadge>
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {formatDurationMinutes(
                        academyModule.estimatedDurationMinutes,
                      )}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {academyModule.videoCount}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {academyModule.resourceCount}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {formatAvailability(academyModule.availability)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        className="font-semibold text-[var(--color-cyan)] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                        href={`/admin/content/modules/${academyModule.id}`}
                      >
                        Ver modulo
                      </Link>
                    </td>
                  </tr>
                ))}
                {modules.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8" colSpan={8}>
                      <AdminEmptyState
                        description="Cuando exista contenido academico sincronizado, los modulos apareceran aqui para su gestion."
                        title="No hay modulos para mostrar"
                      />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
