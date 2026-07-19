import type { Course } from "@/types/academy";

type ProgramHeaderProps = {
  course: Course;
};

export function ProgramHeader({ course }: ProgramHeaderProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8 lg:p-10">
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Programa de Formación
      </p>
      <h1 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">
        Trading Basado en Datos
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
        {course.description}
      </p>
    </section>
  );
}
