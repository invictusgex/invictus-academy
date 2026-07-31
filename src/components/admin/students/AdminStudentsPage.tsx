import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import {
  formatAdminDate,
  formatEnrollmentStatus,
} from "@/components/admin/ui/admin-formatters";
import type { AdminStudentManagementListResult } from "@/lib/types/admin-student-management.types";
import type { AdminStudentsSortBy } from "@/lib/types/admin-students.types";

type AdminStudentsPageProps = {
  query: string;
  result: AdminStudentManagementListResult;
  sortBy: AdminStudentsSortBy;
};

function getDisplayName(fullName: string | null) {
  return fullName?.trim() || "Alumno sin nombre";
}

function getPageHref({
  page,
  query,
  sortBy,
}: {
  page: number;
  query: string;
  sortBy: AdminStudentsSortBy;
}) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (query) {
    params.set("query", query);
  }

  if (sortBy !== "createdAt") {
    params.set("sortBy", sortBy);
  }

  const queryString = params.toString();

  return queryString ? `/admin/students?${queryString}` : "/admin/students";
}

function getSessionTone(unlocked: boolean) {
  return unlocked ? "success" : "warning";
}

export function AdminStudentsPage({
  query,
  result,
  sortBy,
}: AdminStudentsPageProps) {
  const hasStudents = result.students.length > 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Alumnos" title="Gestion de alumnos">
        Consulta alumnos, enrollment activo, producto, avance academico y estado
        de Sesion 101 desde datos server-side.
      </AdminPageHeader>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
        <form
          action="/admin/students"
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem_auto]"
        >
          <label className="grid min-w-0 gap-2 text-sm font-medium text-white">
            Buscar
            <input
              className="min-h-11 min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
              defaultValue={query}
              name="query"
              placeholder="Nombre o email"
              type="search"
            />
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-medium text-white">
            Ordenar por
            <select
              className="min-h-11 min-w-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              defaultValue={sortBy}
              name="sortBy"
            >
              <option value="createdAt">Fecha de alta</option>
              <option value="name">Nombre</option>
              <option value="email">Email</option>
            </select>
          </label>
          <button
            className="min-h-11 self-end rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            type="submit"
          >
            Buscar
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white">
            Registro administrativo
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {result.students.length} de {result.total} alumnos
          </p>
        </div>

        {hasStudents ? (
          <div className="grid gap-4 p-4 lg:hidden">
            {result.students.map((student) => (
              <article
                className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
                key={student.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      className="break-words text-base font-semibold text-white transition hover:text-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                      href={`/admin/students/${student.id}`}
                    >
                      {getDisplayName(student.fullName)}
                    </Link>
                    <p className="mt-2 break-all text-sm text-[var(--color-text-secondary)]">
                      {student.email ?? "No disponible"}
                    </p>
                  </div>
                  <AdminStatusBadge tone={getSessionTone(student.session101.unlocked)}>
                    {student.session101.label}
                  </AdminStatusBadge>
                </div>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Producto</dt>
                    <dd className="break-words text-white">
                      {student.activeEnrollment?.course?.title ?? "Sin enrollment activo"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Progreso</dt>
                    <dd className="text-white">
                      {student.progress
                        ? `${student.progress.completedModules}/${student.progress.totalModules} modulos - ${student.progress.percentage}%`
                        : "Sin progreso"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-text-muted)]">Alta</dt>
                    <dd className="text-white">
                      {formatAdminDate(student.createdAt)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <AdminEmptyState
              description="Ajusta la busqueda o espera a que existan alumnos registrados."
              title="No hay alumnos para mostrar"
            />
          </div>
        )}

        {hasStudents ? (
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-card-bg)] text-xs tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="px-5 py-4 font-semibold">Alumno</th>
                  <th className="px-5 py-4 font-semibold">Enrollment activo</th>
                  <th className="px-5 py-4 font-semibold">Producto</th>
                  <th className="px-5 py-4 font-semibold">Progreso</th>
                  <th className="px-5 py-4 font-semibold">Sesion 101</th>
                </tr>
              </thead>
              <tbody>
                {result.students.map((student) => (
                  <tr
                    className="border-t border-[var(--color-border)]"
                    key={student.id}
                  >
                    <td className="px-5 py-4">
                      <Link
                        className="block max-w-[16rem] break-words font-medium text-white transition hover:text-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                        href={`/admin/students/${student.id}`}
                      >
                        {getDisplayName(student.fullName)}
                      </Link>
                      <span className="mt-1 block max-w-[16rem] break-all text-[var(--color-text-secondary)]">
                        {student.email ?? "No disponible"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge
                        tone={student.activeEnrollment ? "success" : "neutral"}
                      >
                        {formatEnrollmentStatus(student.activeEnrollment?.status)}
                      </AdminStatusBadge>
                    </td>
                    <td className="max-w-[16rem] px-5 py-4 text-[var(--color-text-secondary)]">
                      <span className="block break-words">
                        {student.activeEnrollment?.course?.title ?? "Sin producto"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white">
                      {student.progress
                        ? `${student.progress.completedModules}/${student.progress.totalModules} - ${student.progress.percentage}%`
                        : "Sin progreso"}
                    </td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge tone={getSessionTone(student.session101.unlocked)}>
                        {student.session101.label}
                      </AdminStatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Pagina {result.page} de {result.totalPages}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              aria-disabled={result.page <= 1}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] aria-disabled:pointer-events-none aria-disabled:opacity-50"
              href={getPageHref({
                page: Math.max(1, result.page - 1),
                query,
                sortBy,
              })}
            >
              Anterior
            </Link>
            <Link
              aria-disabled={result.page >= result.totalPages}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] aria-disabled:pointer-events-none aria-disabled:opacity-50"
              href={getPageHref({
                page: Math.min(result.totalPages, result.page + 1),
                query,
                sortBy,
              })}
            >
              Siguiente
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
