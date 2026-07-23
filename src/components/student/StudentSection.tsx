import type { ReactNode } from "react";

type StudentSectionProps = {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function StudentSection({
  actions,
  children,
  description,
  eyebrow,
  title,
}: StudentSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-7 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-balance text-2xl font-semibold text-white">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="w-full shrink-0 sm:w-auto sm:pb-0.5">{actions}</div>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
