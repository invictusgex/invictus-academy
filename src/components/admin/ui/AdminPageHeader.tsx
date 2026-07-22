import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  actions?: ReactNode;
  eyebrow: string;
  children?: ReactNode;
  title: string;
};

export function AdminPageHeader({
  actions,
  children,
  eyebrow,
  title,
}: AdminPageHeaderProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
          {children ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
              {children}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </section>
  );
}
