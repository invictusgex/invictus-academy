"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminContentResourceForm } from "@/components/admin/content/AdminContentResourceForm";
import { AdminContentService } from "@/lib/services/admin-content.service";
import type {
  AdminContentModule,
  AdminContentResource,
} from "@/lib/types/admin-content.types";

type AdminContentResourceEditPageProps = {
  moduleId: string;
  resourceId: string;
};

export function AdminContentResourceEditPage({
  moduleId,
  resourceId,
}: AdminContentResourceEditPageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [academyModule, setAcademyModule] =
    useState<AdminContentModule | null>(null);
  const [resource, setResource] = useState<AdminContentResource | null>(null);

  useEffect(() => {
    let isActive = true;
    const timeoutId = window.setTimeout(() => {
      async function loadModule() {
        setError(false);
        setLoading(true);

        try {
          const moduleResult =
            await AdminContentService.getModuleContent(moduleId);
          const resourceResult =
            moduleResult?.resources.find((currentResource) =>
              currentResource.id === resourceId
            ) ?? null;

          if (isActive) {
            setAcademyModule(moduleResult);
            setResource(resourceResult);
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

      void loadModule();
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [moduleId, resourceId]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Cargando recurso...
        </p>
      </section>
    );
  }

  if (error || !academyModule || !resource) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Recursos
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Recurso no disponible
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
          No fue posible cargar el recurso solicitado.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href={`/admin/content/modules/${moduleId}`}
        >
          Volver al modulo
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <Link
          className="text-sm font-semibold text-[var(--color-cyan)] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href={`/admin/content/modules/${academyModule.id}`}
        >
          Volver al modulo
        </Link>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Modulo {academyModule.position}
        </p>
        <h1 className="mt-3 break-words text-3xl font-semibold text-white">
          Editar recurso
        </h1>
      </section>

      <AdminContentResourceForm
        mode="edit"
        module={academyModule}
        resource={resource}
      />
    </div>
  );
}
