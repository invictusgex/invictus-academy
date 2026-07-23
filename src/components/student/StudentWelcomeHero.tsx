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
    <section className="relative overflow-hidden rounded-2xl border border-cyan-200/20 bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 shadow-[0_18px_54px_rgba(0,0,0,0.2)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 lg:block">
        <div className="absolute right-10 top-8 h-44 w-44 rounded-full border border-cyan-200/10" />
        <div className="absolute right-20 top-20 h-28 w-64 rounded-full border border-cyan-200/10" />
        <div className="absolute right-8 top-1/2 h-px w-72 bg-cyan-200/20" />
        <div className="absolute right-20 top-[58%] h-px w-52 bg-cyan-200/15" />
        <div className="absolute right-36 top-[42%] h-20 w-px bg-cyan-200/15" />
      </div>
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-center">
        <div className="min-w-0">
          {badge ? <StudentStatusBadge tone="info">{badge}</StudentStatusBadge> : null}
          <h1 className="mt-5 max-w-4xl text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
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
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto motion-reduce:transition-none motion-reduce:hover:translate-y-0"
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
