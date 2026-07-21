"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminContentVideoForm } from "@/components/admin/content/AdminContentVideoForm";
import { AdminContentService } from "@/lib/services/admin-content.service";
import type {
  AdminContentModule,
  AdminContentVideo,
} from "@/lib/types/admin-content.types";

type AdminContentVideoEditPageProps = {
  moduleId: string;
  videoId: string;
};

export function AdminContentVideoEditPage({
  moduleId,
  videoId,
}: AdminContentVideoEditPageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [academyModule, setAcademyModule] =
    useState<AdminContentModule | null>(null);
  const [video, setVideo] = useState<AdminContentVideo | null>(null);

  useEffect(() => {
    let isActive = true;
    const timeoutId = window.setTimeout(() => {
      async function loadModule() {
        setError(false);
        setLoading(true);

        try {
          const moduleResult =
            await AdminContentService.getModuleContent(moduleId);
          const videoResult =
            moduleResult?.videos.find((currentVideo) =>
              currentVideo.id === videoId
            ) ?? null;

          if (isActive) {
            setAcademyModule(moduleResult);
            setVideo(videoResult);
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
  }, [moduleId, videoId]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Cargando video...
        </p>
      </section>
    );
  }

  if (error || !academyModule || !video) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Videos
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Video no disponible
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
          No fue posible cargar el video solicitado.
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
          Editar video
        </h1>
      </section>

      <AdminContentVideoForm
        mode="edit"
        module={academyModule}
        video={video}
      />
    </div>
  );
}
