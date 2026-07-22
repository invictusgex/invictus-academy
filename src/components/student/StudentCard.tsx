import type { ReactNode } from "react";

import { classNames } from "@/utils/class-names";

type StudentCardProps = {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
};

export function StudentCard({
  children,
  className,
  elevated = false,
}: StudentCardProps) {
  return (
    <article
      className={classNames(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 sm:p-6",
        elevated && "shadow-[0_20px_70px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      {children}
    </article>
  );
}
