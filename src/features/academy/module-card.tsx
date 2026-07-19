import Link from "next/link";

import type { AcademyModule } from "@/types/academy";

type ModuleCardProps = {
  module: AcademyModule;
  showAction?: boolean;
};

export function ModuleCard({ module, showAction = false }: ModuleCardProps) {
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
      {showAction ? (
        <Link
          href={`/academy/programa/${module.id}`}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
        >
          Entrar
        </Link>
      ) : null}
    </article>
  );
}
