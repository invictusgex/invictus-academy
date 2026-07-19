import type { Course } from "@/types/academy";

type ProgramSummaryProps = {
  course: Course;
};

export function ProgramSummary({ course }: ProgramSummaryProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Total
        </p>
        <p className="mt-3 text-2xl font-semibold text-white">
          {course.modules.length} módulos
        </p>
      </article>
      <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Estado de formación
        </p>
        <p className="mt-3 text-2xl font-semibold text-white">No iniciado</p>
      </article>
      <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Trayectoria
        </p>
        <p className="mt-3 text-2xl font-semibold text-white">
          0 de {course.modules.length}
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          módulos completados
        </p>
      </article>
    </section>
  );
}
