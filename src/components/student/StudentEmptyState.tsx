import Link from "next/link";
import type { ReactNode } from "react";

type StudentEmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
  title: string;
};

export function StudentEmptyState({
  actionHref,
  actionLabel,
  children,
  title,
}: StudentEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 text-center sm:p-8">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {children ? (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
          {children}
        </p>
      ) : null}
      {actionHref && actionLabel ? (
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
