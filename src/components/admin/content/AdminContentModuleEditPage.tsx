"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminContentModuleGeneralInfoForm } from "@/components/admin/content/AdminContentModuleGeneralInfoForm";
import { AdminContentService } from "@/lib/services/admin-content.service";
import type { AdminContentModule } from "@/lib/types/admin-content.types";

type AdminContentModuleEditPageProps = {
  moduleId: string;
};

export function AdminContentModuleEditPage({
  moduleId,
}: AdminContentModuleEditPageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [academyModule, setAcademyModule] =
    useState<AdminContentModule | null>(null);

  useEffect(() => {
    let isActive = true;
    const timeoutId = window.setTimeout(() => {
      async function loadModule() {
        setError(false);
        setLoading(true);

        try {
          const moduleResult =
            await AdminContentService.getModuleContent(moduleId);

          if (isActive) {
            setAcademyModule(moduleResult);
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
  }, [moduleId]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Cargando modulo...
        </p>
      </section>
    );
  }

  if (error || !academyModule) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Contenido
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Modulo no disponible
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
          No fue posible cargar la informacion editable del modulo.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href="/admin/content"
        >
          Volver a contenido
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
          {academyModule.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Edita solo la informacion general del modulo. Videos y recursos se
          mantienen en modo lectura.
        </p>
      </section>

      <AdminContentModuleGeneralInfoForm
        module={academyModule}
        onSaved={setAcademyModule}
      />
    </div>
  );
}
