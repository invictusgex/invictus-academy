import Link from "next/link";

import { AcademyShell } from "@/components/layout/academy-shell";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getProvisionalCourse } from "@/lib/academy-content";

export default function AcademyPage() {
  const course = getProvisionalCourse();

  return (
    <AcademyShell>
      <section className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(180deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Academia
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
          Bienvenido a Invictus
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Tu espacio de formación para estudiar el mercado con estructura,
          evidencia y disciplina.
        </p>
        <Link
          href="/academy/programa"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
        >
          Continuar aprendiendo
        </Link>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Tu progreso
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Progreso general
            </h2>
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">
            Aún no has comenzado ningún módulo.
          </p>
        </div>
        <div className="mt-6">
          <ProgressBar label="Progreso general" value={0} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Curso
        </p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Trading basado en datos
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
              Curso principal de Invictus Trading Academy.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-text-secondary)]">
                {course.modules.length} módulos
              </span>
              <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-text-muted)]">
                Estado: No iniciado
              </span>
            </div>
          </div>

          <Link
            href="/academy/programa"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
          >
            Ver programa completo
          </Link>
        </div>
      </section>
    </AcademyShell>
  );
}
