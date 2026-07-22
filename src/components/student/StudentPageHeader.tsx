import type { ReactNode } from "react";

type StudentPageHeaderProps = {
  actions?: ReactNode;
  eyebrow?: string;
  children?: ReactNode;
  title: string;
};

export function StudentPageHeader({
  actions,
  children,
  eyebrow,
  title,
}: StudentPageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
          {title}
        </h1>
        {children ? (
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
            {children}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
