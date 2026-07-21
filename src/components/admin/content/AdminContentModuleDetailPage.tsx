"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  formatAvailability,
  formatContentStatus,
  formatDateTime,
  formatDurationMinutes,
  formatDurationSeconds,
  formatResourceType,
} from "@/components/admin/content/admin-content-formatters";
import { AdminContentVideoDeleteConfirmation } from "@/components/admin/content/AdminContentVideoDeleteConfirmation";
import { AdminContentVideoOrderControls } from "@/components/admin/content/AdminContentVideoOrderControls";
import { AdminContentService } from "@/lib/services/admin-content.service";
import type { AdminContentModule } from "@/lib/types/admin-content.types";

type AdminContentModuleDetailPageProps = {
  moduleId: string;
};

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 text-sm text-[var(--color-text-secondary)]">
      {message}
    </p>
  );
}

export function AdminContentModuleDetailPage({
  moduleId,
}: AdminContentModuleDetailPageProps) {
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

  if (error) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Contenido
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          No disponible
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
          No fue posible cargar el modulo solicitado.
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

  if (!academyModule) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Contenido
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Modulo no encontrado
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
          El modulo solicitado no existe en el contenido academico.
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
          href="/admin/content"
        >
          Volver a contenido
        </Link>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Modulo {academyModule.position}
        </p>
        <h1 className="mt-3 break-words text-3xl font-semibold text-white">
          {academyModule.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Vista administrativa de lectura para informacion general, videos y
          recursos del modulo.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href={`/admin/content/modules/${academyModule.id}/edit`}
        >
          Editar informacion
        </Link>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">
          Informacion general
        </h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Titulo
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-white">
              {academyModule.title}
            </p>
          </article>
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Estado
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-cyan)]">
              {formatContentStatus(academyModule.status)}
            </p>
          </article>
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Disponibilidad
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {formatAvailability(academyModule.availability)}
            </p>
          </article>
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Duracion estimada
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {formatDurationMinutes(academyModule.estimatedDurationMinutes)}
            </p>
          </article>
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Fecha de publicacion
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              {formatDateTime(academyModule.publishedAt)}
            </p>
          </article>
        </div>

        <div className="mt-5 grid gap-4">
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Descripcion
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {academyModule.description || "Sin descripcion"}
            </p>
          </article>
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Overview
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              {academyModule.overview || "Sin overview"}
            </p>
          </article>
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Objetivos
            </p>
            {academyModule.learningObjectives.length > 0 ? (
              <ul className="mt-3 grid gap-2 text-sm text-[var(--color-text-secondary)]">
                {academyModule.learningObjectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Sin objetivos registrados.
              </p>
            )}
          </article>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-white">Videos</h2>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--color-cyan)] px-4 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            href={`/admin/content/modules/${academyModule.id}/videos/new`}
          >
            Agregar video
          </Link>
        </div>
        {academyModule.videos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[74rem] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-card-bg)] text-xs tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="px-5 py-4 font-semibold">Posicion</th>
                  <th className="px-5 py-4 font-semibold">Titulo</th>
                  <th className="px-5 py-4 font-semibold">Proveedor</th>
                  <th className="px-5 py-4 font-semibold">Duracion</th>
                  <th className="px-5 py-4 font-semibold">Estado</th>
                  <th className="px-5 py-4 font-semibold">Miniatura</th>
                  <th className="px-5 py-4 font-semibold">Orden</th>
                  <th className="px-5 py-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {academyModule.videos.map((video, index) => (
                  <tr
                    className="border-t border-[var(--color-border)]"
                    key={video.id}
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      {video.position}
                    </td>
                    <td className="px-5 py-4 font-medium text-white">
                      {video.title}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {video.provider ?? "Sin proveedor"}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {formatDurationSeconds(video.durationSeconds)}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-cyan)]">
                      {formatContentStatus(video.status)}
                    </td>
                    <td className="px-5 py-4">
                      {video.thumbnailUrl ? (
                        <Image
                          alt={`Miniatura de ${video.title}`}
                          className="h-14 w-24 rounded-lg border border-[var(--color-border)] object-cover"
                          height={56}
                          src={video.thumbnailUrl}
                          unoptimized
                          width={96}
                        />
                      ) : (
                        <span className="text-[var(--color-text-secondary)]">
                          Sin miniatura
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <AdminContentVideoOrderControls
                        disabledDown={index === academyModule.videos.length - 1}
                        disabledUp={index === 0}
                        moduleId={academyModule.id}
                        onUpdated={setAcademyModule}
                        videoId={video.id}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid gap-2">
                        <Link
                          className="font-semibold text-[var(--color-cyan)] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                          href={`/admin/content/modules/${academyModule.id}/videos/${video.id}/edit`}
                        >
                          Editar
                        </Link>
                        <AdminContentVideoDeleteConfirmation
                          moduleId={academyModule.id}
                          onUpdated={setAcademyModule}
                          videoId={video.id}
                          videoTitle={video.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState message="No hay videos registrados para este modulo." />
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
        <div className="border-b border-[var(--color-border)] p-5">
          <h2 className="text-xl font-semibold text-white">Recursos</h2>
        </div>
        {academyModule.resources.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[54rem] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-card-bg)] text-xs tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="px-5 py-4 font-semibold">Posicion</th>
                  <th className="px-5 py-4 font-semibold">Titulo</th>
                  <th className="px-5 py-4 font-semibold">Tipo</th>
                  <th className="px-5 py-4 font-semibold">Descripcion</th>
                  <th className="px-5 py-4 font-semibold">Estado</th>
                  <th className="px-5 py-4 font-semibold">Enlace</th>
                </tr>
              </thead>
              <tbody>
                {academyModule.resources.map((resource) => (
                  <tr
                    className="border-t border-[var(--color-border)]"
                    key={resource.id}
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      {resource.position}
                    </td>
                    <td className="px-5 py-4 font-medium text-white">
                      {resource.title}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {formatResourceType(resource.resourceType)}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {resource.description || "Sin descripcion"}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-cyan)]">
                      {formatContentStatus(resource.status)}
                    </td>
                    <td className="px-5 py-4">
                      {resource.url ? (
                        <a
                          className="font-semibold text-[var(--color-cyan)] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                          href={resource.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Abrir enlace
                        </a>
                      ) : (
                        <span className="text-[var(--color-text-secondary)]">
                          Sin enlace
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState message="No hay recursos registrados para este modulo." />
          </div>
        )}
      </section>
    </div>
  );
}
