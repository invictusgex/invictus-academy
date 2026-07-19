import type { Course } from "@/types/academy";

type FormationTrajectoryProps = {
  course: Course;
};

export function FormationTrajectory({ course }: FormationTrajectoryProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Trayectoria
      </p>
      <div className="mt-6 space-y-4">
        {course.modules.map((module) => (
          <div
            key={module.id}
            className="flex gap-4 border-l border-[var(--color-border)] pl-4"
          >
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full border border-[var(--color-cyan)] bg-[var(--color-panel-bg)]" />
            <div>
              <p className="text-sm font-semibold text-white">
                Módulo {module.number}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {module.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
