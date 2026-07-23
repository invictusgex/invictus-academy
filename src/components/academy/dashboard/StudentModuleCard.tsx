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

  return (
    <StudentCard>
      {thumbnailUrl ? (
        <Image
          alt={`Miniatura de ${academyModule.title}`}
          className="h-36 w-full rounded-xl border border-[var(--color-border)] object-cover"
          height={220}
          src={thumbnailUrl}
          unoptimized
          width={360}
        />
      ) : (
        <div className="flex h-36 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] text-sm text-[var(--color-text-muted)]">
          Sin miniatura
        </div>
      )}
      <div className="mt-5 flex items-start justify-between gap-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
          Modulo {academyModule.number}
        </p>
        <StudentStatusBadge
          tone={status === "completed" ? "complete" : status === "in-progress" ? "progress" : "neutral"}
        >
          {statusLabel}
        </StudentStatusBadge>
      </div>
      <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-white">
        {academyModule.title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
        {academyModule.overview || academyModule.description}
      </p>
      <Link
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
        href={`/academy/programa/${academyModule.id}`}
      >
        Ver modulo
      </Link>
    </StudentCard>
  );
}
