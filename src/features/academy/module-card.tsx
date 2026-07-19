import type { AcademyModule } from "@/types/academy";

type ModuleCardProps = {
  module: AcademyModule;
};

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Módulo {module.moduleNumber}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-white">
            {module.title}
          </h3>
        </div>
        <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
          {module.status}
        </span>
      </div>
      <p className="mt-5 text-sm leading-6 text-[var(--color-text-secondary)]">
        {module.description}
      </p>
    </article>
  );
}
