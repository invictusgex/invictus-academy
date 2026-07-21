"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminAccessManager } from "@/components/admin/access/AdminAccessManager";
import { AdminStudentsService } from "@/lib/services/admin-students.service";
import type { AdminStudent } from "@/lib/types/admin-students.types";

type AdminStudentDetailPageProps = {
  userId: string;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Sin registro";
  }

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getDisplayName(student: AdminStudent) {
  return student.fullName?.trim() || "Alumno sin nombre";
}

export function AdminStudentDetailPage({
  userId,
}: AdminStudentDetailPageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<AdminStudent | null>(null);

  useEffect(() => {
    let isActive = true;
    const timeoutId = window.setTimeout(() => {
      async function loadStudent() {
        setLoading(true);
        setError(false);

        try {
          const studentResult = await AdminStudentsService.getStudent(userId);

          if (isActive) {
            setStudent(studentResult);
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

      void loadStudent();
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [userId]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Cargando detalle del alumno...
        </p>
      </section>
    );
  }

  if (error || !student) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Alumno
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          No disponible
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
          No fue posible cargar el detalle administrativo solicitado.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href="/admin/students"
        >
          Volver al listado
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <Link
          className="text-sm font-semibold text-[var(--color-cyan)] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href="/admin/students"
        >
          Volver al listado
        </Link>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Alumno
        </p>
        <h1 className="mt-3 break-words text-3xl font-semibold text-white">
          {getDisplayName(student)}
        </h1>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <p className="rounded-xl border border-[var(--color-border)] p-4 text-[var(--color-text-secondary)]">
            <span className="block font-semibold text-white">Email</span>
            {student.email ?? "No disponible"}
          </p>
          <p className="rounded-xl border border-[var(--color-border)] p-4 text-[var(--color-text-secondary)]">
            <span className="block font-semibold text-white">Alta</span>
            {formatDateTime(student.createdAt)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Cursos inscritos</h2>
        <div className="mt-5 grid gap-4">
          {student.enrollments.map((enrollment) => (
            <article
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5"
              key={enrollment.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {enrollment.course?.title ?? "Curso sin titulo"}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Inscripción: {formatDateTime(enrollment.createdAt)}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-cyan)]">
                  {enrollment.status}
                </span>
              </div>
            </article>
          ))}
          {student.enrollments.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              No hay cursos inscritos para este alumno.
            </p>
          ) : null}
        </div>
      </section>

      <AdminAccessManager
        initialStudentId={student.id}
        initialStudentLabel={getDisplayName(student)}
        showSearch={false}
      />

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Progreso por curso</h2>
        <div className="mt-5 grid gap-4">
          {student.progress.map((progress) => {
            const enrollment = student.enrollments.find(
              (currentEnrollment) =>
                currentEnrollment.productId === progress.productId,
            );

            return (
              <article
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5"
                key={progress.productId}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {enrollment?.course?.title ?? "Curso sin titulo"}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      {progress.completedModules} de {progress.totalModules}{" "}
                      módulos completados
                    </p>
                  </div>
                  <span className="text-2xl font-semibold text-white">
                    {progress.percentage} %
                  </span>
                </div>
                <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
                  Última actividad: {formatDateTime(progress.lastActivityAt)}
                </p>
              </article>
            );
          })}
          {student.progress.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              No hay progreso registrado para este alumno.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Módulos</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <thead className="bg-[var(--color-card-bg)] text-xs tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              <tr>
                <th className="px-5 py-4 font-semibold">Módulo</th>
                <th className="px-5 py-4 font-semibold">Porcentaje</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 font-semibold">Última actividad</th>
              </tr>
            </thead>
            <tbody>
              {student.moduleProgress.map((moduleProgress) => (
                <tr
                  className="border-t border-[var(--color-border)]"
                  key={`${moduleProgress.moduleKey}-${moduleProgress.status}`}
                >
                  <td className="px-5 py-4 font-medium text-white">
                    {moduleProgress.moduleKey}
                  </td>
                  <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                    {moduleProgress.percentage} %
                  </td>
                  <td className="px-5 py-4 text-[var(--color-cyan)]">
                    {moduleProgress.status}
                  </td>
                  <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                    {formatDateTime(moduleProgress.lastActivityAt)}
                  </td>
                </tr>
              ))}
              {student.moduleProgress.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-8 text-center text-[var(--color-text-secondary)]"
                    colSpan={4}
                  >
                    No hay módulos con progreso registrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
