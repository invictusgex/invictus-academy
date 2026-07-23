import Link from "next/link";
import type { ReactNode } from "react";

import { StudentCard } from "@/components/student/StudentCard";
import { StudentStatusBadge } from "@/components/student/StudentStatusBadge";

type StudentActionCardProps = {
  badge?: string;
  children?: ReactNode;
  ctaHref: string;
  ctaLabel: string;
  eyebrow?: string;
  title: string;
};

export function StudentActionCard({
  badge,
  children,
  ctaHref,
  ctaLabel,
  eyebrow,
  title,
}: StudentActionCardProps) {
  return (
    <StudentCard className="h-full" elevated>
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
          </div>
          {badge ? <StudentStatusBadge tone="info">{badge}</StudentStatusBadge> : null}
        </div>
        {children ? (
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            {children}
          </p>
        ) : null}
        <Link
          className="mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-fit motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          href={ctaHref}
        >
          {ctaLabel}
        </Link>
      </div>
    </StudentCard>
  );
}
