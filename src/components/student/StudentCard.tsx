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
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 transition-colors duration-200 hover:border-cyan-200/35 sm:p-6 motion-reduce:transition-none",
        elevated && "shadow-[0_18px_46px_rgba(0,0,0,0.18)]",
        className,
      )}
    >
      {children}
    </article>
  );
}
