import Link from "next/link";
import type { ReactNode } from "react";

import { StudentStatusBadge } from "@/components/student/StudentStatusBadge";

type StudentWelcomeHeroProps = {
  badge?: string;
  ctaHref?: string;
  ctaLabel?: string;
  description: string;
  greeting: string;
  image?: ReactNode;
  name?: string;
};

export function StudentWelcomeHero({
  badge,
  ctaHref,
  ctaLabel,
  description,
  greeting,
  image,
  name,
}: StudentWelcomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8 lg:p-10">
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
        <div className="min-w-0">
          {badge ? <StudentStatusBadge tone="info">{badge}</StudentStatusBadge> : null}
          <h1 className="mt-5 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            {greeting}
            {name ? (
              <>
                , <span className="text-[var(--color-cyan)]">{name}</span>
              </>
            ) : null}
            .
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-text-secondary)]">
            {description}
          </p>
          {ctaHref && ctaLabel ? (
            <Link
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
              href={ctaHref}
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>
        {image ? (
          <div className="hidden min-h-56 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] lg:block">
            {image}
          </div>
        ) : null}
      </div>
    </section>
  );
}
