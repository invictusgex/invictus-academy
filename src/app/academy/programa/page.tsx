import { AcademyShell } from "@/components/layout/academy-shell";
import { ModuleCard } from "@/features/academy/module-card";
import { getProvisionalCourse } from "@/lib/academy-content";

export default function AcademyProgramPage() {
  const course = getProvisionalCourse();

  return (
    <AcademyShell>
      <section>
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Programa
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Mi programa
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          {course.description}
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {course.modules.map((module) => (
          <ModuleCard
            key={module.number}
            module={module}
            showAction
            showLearningDetails
          />
        ))}
      </section>
    </AcademyShell>
  );
}
