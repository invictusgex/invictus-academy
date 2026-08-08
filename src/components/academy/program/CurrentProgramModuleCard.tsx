import Link from "next/link";

import { getModuleStatusTone } from "@/components/academy/dashboard/student-dashboard-utils";
import { StudentStatusBadge } from "@/components/student";
import type { Module } from "@/types/academy";
import type { ModuleProgressStatus } from "@/utils/module-progress";

type CurrentProgramModuleCardProps = {
  academyModule: Module;
  ctaLabel: string;
  status: ModuleProgressStatus;
  statusLabel: string;
};

export function CurrentProgramModuleCard({
  academyModule,
  ctaLabel,
  status,
  statusLabel,
}: CurrentProgramModuleCardProps) {
  return (
    <article className="rounded-2xl border border-cyan-200/25 bg-[var(--color-card-bg)] p-5 shadow-[0_16px_44px_rgba(0,0,0,0.16)] sm:p-6">
      <div className="flex min-w-0 flex-col justify-between gap-6">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Etapa {academyModule.number}
            </p>
            <StudentStatusBadge tone={getModuleStatusTone(status)}>
              {statusLabel}
            </StudentStatusBadge>
          </div>
          <h3 className="mt-4 max-w-3xl break-words text-2xl font-semibold leading-tight text-white sm:text-3xl">
            {academyModule.title}
          </h3>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base sm:leading-7">
            {academyModule.overview || academyModule.description}
          </p>
        </div>
        <Link
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-fit motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          href={`/academy/programa/${academyModule.id}`}
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
