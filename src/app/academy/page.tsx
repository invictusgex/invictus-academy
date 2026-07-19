import Link from "next/link";

import { DashboardHero } from "@/components/academy/DashboardHero";
import { AcademyShell } from "@/components/layout/academy-shell";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getAcademyProgram } from "@/lib/academy";

export default function AcademyPage() {
  const course = getAcademyProgram();
  const availableModules = course.modules.filter(
    (module) => module.availability === "available",
  );
  const availabilityPercentage =
    course.modules.length > 0
      ? Math.round((availableModules.length / course.modules.length) * 100)
      : 0;

  return (
    <AcademyShell>
      <DashboardHero userName="Ariel" />

      <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Próxima etapa
        </p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-text-muted)]">
              Programa de Formación
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {course.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              {course.modules.length} módulos estructurados
            </p>
          </div>
          <Link
            href="/academy/programa"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Consultar estructura
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Disponibilidad
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Próximamente
            </h2>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            {availableModules.length} de {course.modules.length} módulos
            disponibles
          </p>
        </div>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          El contenido principal del programa está en preparación.
        </p>
        <div className="mt-6">
          <ProgressBar
            label="Disponibilidad del programa"
            value={availabilityPercentage}
          />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Programa activo
        </p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {course.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
              Programa de Formación Profesional
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-text-secondary)]">
                {course.modules.length} módulos
              </span>
              <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-text-muted)]">
                Disponibilidad: Próximamente
              </span>
            </div>
          </div>

          <Link
            href="/academy/programa"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Acceder al programa
          </Link>
        </div>
      </section>
    </AcademyShell>
  );
}
