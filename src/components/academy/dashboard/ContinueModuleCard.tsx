import Image from "next/image";
import Link from "next/link";

import { getExternalThumbnailUrl } from "@/components/academy/dashboard/student-dashboard-utils";
import { StudentStatusBadge } from "@/components/student";
import type { Module } from "@/types/academy";
import type { ModuleProgressStatus } from "@/utils/module-progress";

type ContinueModuleCardProps = {
  academyModule: Module;
  ctaLabel: string;
  statusLabel: string;
  status: ModuleProgressStatus;
};

export function ContinueModuleCard({
  academyModule,
  ctaLabel,
  status,
  statusLabel,
}: ContinueModuleCardProps) {
  const thumbnailUrl =
    academyModule.thumbnailUrl ??
    getExternalThumbnailUrl(academyModule.videos[0]?.thumbnailUrl);

  return (
    <article className="grid gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 sm:p-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      {thumbnailUrl ? (
        <Image
          alt={`Miniatura de ${academyModule.title}`}
          className="h-48 w-full rounded-xl border border-[var(--color-border)] object-cover lg:h-full"
          height={320}
          src={thumbnailUrl}
          unoptimized
          width={420}
        />
      ) : (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] text-sm text-[var(--color-text-muted)]">
          Sin miniatura
        </div>
      )}

      <div className="flex min-w-0 flex-col justify-between gap-5">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Modulo {academyModule.number}
            </p>
            <StudentStatusBadge
              tone={status === "completed" ? "complete" : status === "in-progress" ? "progress" : "neutral"}
            >
              {statusLabel}
            </StudentStatusBadge>
          </div>
          <h3 className="mt-3 break-words text-2xl font-semibold text-white">
            {academyModule.title}
          </h3>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            {academyModule.overview || academyModule.description}
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-fit"
          href={`/academy/programa/${academyModule.id}`}
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
