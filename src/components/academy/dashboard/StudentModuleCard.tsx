import Image from "next/image";
import Link from "next/link";

import { getExternalThumbnailUrl } from "@/components/academy/dashboard/student-dashboard-utils";
import { StudentCard, StudentStatusBadge } from "@/components/student";
import type { Module } from "@/types/academy";
import type { ModuleProgressStatus } from "@/utils/module-progress";

type StudentModuleCardProps = {
  academyModule: Module;
  status: ModuleProgressStatus;
  statusLabel: string;
};

export function StudentModuleCard({
  academyModule,
  status,
  statusLabel,
}: StudentModuleCardProps) {
  const thumbnailUrl =
    academyModule.thumbnailUrl ??
    getExternalThumbnailUrl(academyModule.videos[0]?.thumbnailUrl);
  const statusTone =
    status === "completed"
      ? "complete"
      : status === "in-progress"
        ? "progress"
        : "neutral";

  return (
    <StudentCard className="flex h-full flex-col">
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
        {thumbnailUrl ? (
          <Image
            alt={`Miniatura de ${academyModule.title}`}
            className="aspect-[16/10] w-full object-cover"
            height={220}
            src={thumbnailUrl}
            unoptimized
            width={360}
          />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] text-sm text-[var(--color-text-muted)]">
            <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
              Sin miniatura
            </span>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
          Modulo {academyModule.number}
        </p>
        <StudentStatusBadge tone={statusTone}>
          {statusLabel}
        </StudentStatusBadge>
      </div>
      <h3 className="mt-3 line-clamp-2 min-h-14 text-lg font-semibold leading-7 text-white">
        {academyModule.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
        {academyModule.overview || academyModule.description}
      </p>
      <Link
        className="mt-auto inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        href={`/academy/programa/${academyModule.id}`}
      >
        Ver modulo
      </Link>
    </StudentCard>
  );
}
