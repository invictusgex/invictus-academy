import Image from "next/image";
import Link from "next/link";

import { getModuleStatusTone } from "@/components/academy/dashboard/student-dashboard-utils";
import { StudentCard, StudentStatusBadge } from "@/components/student";
import type { Module } from "@/types/academy";
import type { ModuleProgressStatus } from "@/utils/module-progress";

type StudentProgramModuleCardProps = {
  academyModule: Module;
  ctaLabel: string;
  status: ModuleProgressStatus;
  statusLabel: string;
};

export function StudentProgramModuleCard({
  academyModule,
  ctaLabel,
  status,
  statusLabel,
}: StudentProgramModuleCardProps) {
  return (
    <StudentCard className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)_auto] lg:items-center">
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
        {academyModule.thumbnailUrl ? (
          <Image
            alt={`Miniatura de ${academyModule.title}`}
            className="aspect-[16/10] w-full object-cover lg:aspect-square"
            height={220}
            src={academyModule.thumbnailUrl}
            unoptimized
            width={320}
          />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] text-sm text-[var(--color-text-muted)] lg:aspect-square">
            <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
              Sin miniatura
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
            Modulo {academyModule.number}
          </p>
          <StudentStatusBadge tone={getModuleStatusTone(status)}>
            {statusLabel}
          </StudentStatusBadge>
        </div>
        <h3 className="mt-3 text-balance text-xl font-semibold text-white">
          {academyModule.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {academyModule.overview || academyModule.description}
        </p>
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          {academyModule.videos.length} video
          {academyModule.videos.length === 1 ? "" : "s"} -{" "}
          {academyModule.resources.length} recurso
          {academyModule.resources.length === 1 ? "" : "s"}
        </p>
      </div>

      <Link
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] lg:w-fit motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        href={`/academy/programa/${academyModule.id}`}
      >
        {ctaLabel}
      </Link>
    </StudentCard>
  );
}
