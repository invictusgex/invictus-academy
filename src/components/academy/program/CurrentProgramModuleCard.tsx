import Image from "next/image";
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
    <article className="grid gap-5 rounded-2xl border border-cyan-200/25 bg-[var(--color-card-bg)] p-4 shadow-[0_16px_44px_rgba(0,0,0,0.16)] sm:p-5 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
        {academyModule.thumbnailUrl ? (
          <Image
            alt={`Miniatura de ${academyModule.title}`}
            className="aspect-[16/10] w-full object-cover lg:h-full lg:min-h-64"
            height={320}
            src={academyModule.thumbnailUrl}
            unoptimized
            width={420}
          />
        ) : (
          <div className="flex aspect-[16/10] min-h-48 items-center justify-center bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] text-sm text-[var(--color-text-muted)] lg:h-full lg:min-h-64">
            <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
              Sin miniatura
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-6 p-1 sm:p-2">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Modulo {academyModule.number}
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
