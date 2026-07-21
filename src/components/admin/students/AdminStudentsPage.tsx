"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { AdminStudentsService } from "@/lib/services/admin-students.service";
import type {
  AdminStudent,
  AdminStudentsListResult,
  AdminStudentsSortBy,
} from "@/lib/types/admin-students.types";

const pageSize = 10;

function formatDate(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getDisplayName(student: AdminStudent) {
  return student.fullName?.trim() || "Alumno sin nombre";
}

function getCourseSummary(student: AdminStudent) {
  if (student.courses.length === 0) {
    return "Sin cursos";
  }

  return student.courses
    .map((enrollment) => enrollment.course?.title ?? "Curso sin titulo")
    .join(", ");
}

function getPrimaryProgress(student: AdminStudent) {
  return (
    student.progress[0] ?? {
      completedModules: 0,
      lastActivityAt: null,
      percentage: 0,
      productId: "",
      status: "No iniciado" as const,
      totalModules: 0,
    }
  );
}

export function AdminStudentsPage() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [queryInput, setQueryInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [sortBy, setSortBy] = useState<AdminStudentsSortBy>("createdAt");
  const [result, setResult] = useState<AdminStudentsListResult | null>(null);

  useEffect(() => {
    let isActive = true;
    const timeoutId = window.setTimeout(() => {
      async function loadStudents() {
        setLoading(true);
        setError(false);

        try {
          const studentsResult = await AdminStudentsService.listStudents({
            page,
            pageSize,
            query: submittedQuery,
            sortBy,
            sortDirection: "desc",
          });

          if (isActive) {
            setResult(studentsResult);
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

      void loadStudents();
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [page, sortBy, submittedQuery]);

  const students = result?.students ?? [];
  const totalPages = result?.totalPages ?? 1;
  const showingLabel = useMemo(() => {
    if (!result) {
      return "Preparando listado";
    }

    return `${result.students.length} de ${result.total} alumnos`;
  }, [result]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSubmittedQuery(queryInput.trim());
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Alumnos
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Listado de alumnos
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Consulta administrativa de alumnos inscritos, cursos y progreso
          academico registrado.
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
        <form
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem_auto]"
          onSubmit={handleSearch}
        >
          <label className="grid gap-2 text-sm font-medium text-white">
            Buscar
            <input
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder="Nombre o email"
              type="search"
              value={queryInput}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-white">
            Ordenar por
            <select
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              onChange={(event) =>
                setSortBy(event.target.value as AdminStudentsSortBy)
              }
              value={sortBy}
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

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white">
            Registro administrativo
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {loading ? "Cargando alumnos..." : showingLabel}
          </p>
        </div>

        {error ? (
          <div className="p-5 text-sm text-[var(--color-text-secondary)]">
            No fue posible cargar el listado administrativo.
          </div>
        ) : null}

        {!error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-card-bg)] text-xs tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="px-5 py-4 font-semibold">Nombre</th>
                  <th className="px-5 py-4 font-semibold">Email</th>
                  <th className="px-5 py-4 font-semibold">
                    Fecha de inscripción
                  </th>
                  <th className="px-5 py-4 font-semibold">Cursos</th>
                  <th className="px-5 py-4 font-semibold">Porcentaje</th>
                  <th className="px-5 py-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const progress = getPrimaryProgress(student);

                  return (
                    <tr
                      className="border-t border-[var(--color-border)]"
                      key={student.id}
                    >
                      <td className="px-5 py-4 font-medium text-white">
                        <Link
                          className="transition hover:text-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                          href={`/admin/students/${student.id}`}
                        >
                          {getDisplayName(student)}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                        {student.email ?? "No disponible"}
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                        {formatDate(student.lastEnrollmentAt)}
                      </td>
                      <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                        {getCourseSummary(student)}
                      </td>
                      <td className="px-5 py-4 text-white">
                        {progress.percentage} %
                      </td>
                      <td className="px-5 py-4 text-[var(--color-cyan)]">
                        {progress.status}
                      </td>
                    </tr>
                  );
                })}
                {!loading && students.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-8 text-center text-[var(--color-text-secondary)]"
                      colSpan={6}
                    >
                      No hay alumnos para mostrar.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-3">
            <button
              className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              type="button"
            >
              Anterior
            </button>
            <button
              className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((currentPage) =>
                  Math.min(totalPages, currentPage + 1),
                )
              }
              type="button"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
