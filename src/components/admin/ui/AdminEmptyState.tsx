import Link from "next/link";

type AdminEmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
};

export function AdminEmptyState({
  actionHref,
  actionLabel,
  description,
  title,
}: AdminEmptyStateProps) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 text-center">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--color-cyan)] px-4 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
