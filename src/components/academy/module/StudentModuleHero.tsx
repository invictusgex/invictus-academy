import Image from "next/image";
import Link from "next/link";

import { getModuleStatusTone } from "@/components/academy/dashboard/student-dashboard-utils";
import { StudentStatusBadge } from "@/components/student";
import type { Module } from "@/types/academy";
import type { ModuleProgressStatus } from "@/utils/module-progress";

type StudentModuleHeroProps = {
  academyModule: Module;
  status: ModuleProgressStatus;
  statusLabel: string;
  thumbnailUrl: string | null;
};

export function StudentModuleHero({
  academyModule,
  status,
  statusLabel,
  thumbnailUrl,
}: StudentModuleHeroProps) {
  return (
    <section className="grid gap-6 rounded-2xl border border-cyan-200/20 bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-5 shadow-[0_18px_54px_rgba(0,0,0,0.2)] sm:p-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:p-10">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Modulo {String(academyModule.number).padStart(2, "0")}
          </p>
          <StudentStatusBadge tone={getModuleStatusTone(status)}>
            {statusLabel}
          </StudentStatusBadge>
        </div>
        <h1 className="mt-5 max-w-4xl text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
          {academyModule.title}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          {academyModule.description}
        </p>
        {academyModule.videos.length > 0 ? (
          <Link
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            href="#videos"
          >
            Ver videos del modulo
          </Link>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
        {thumbnailUrl ? (
          <Image
            alt={`Miniatura de ${academyModule.title}`}
            className="aspect-[16/10] w-full object-cover lg:aspect-[4/3]"
            height={360}
            src={thumbnailUrl}
            unoptimized
            width={520}
          />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] text-sm text-[var(--color-text-muted)] lg:aspect-[4/3]">
            <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
              Sin miniatura
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
