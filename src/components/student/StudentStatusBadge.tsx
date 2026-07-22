import type { ReactNode } from "react";

import { classNames } from "@/utils/class-names";

export type StudentStatusTone =
  | "complete"
  | "info"
  | "neutral"
  | "progress"
  | "warning";

type StudentStatusBadgeProps = {
  children: ReactNode;
  tone?: StudentStatusTone;
};

export function StudentStatusBadge({
  children,
  tone = "neutral",
}: StudentStatusBadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex min-h-7 w-fit items-center rounded-full border px-3 text-xs font-semibold",
        tone === "complete" && "border-emerald-200/40 text-emerald-200",
        tone === "info" && "border-[var(--color-border)] text-[var(--color-cyan)]",
        tone === "neutral" &&
          "border-[var(--color-border)] text-[var(--color-text-secondary)]",
        tone === "progress" && "border-cyan-200/40 text-[var(--color-cyan)]",
        tone === "warning" && "border-amber-200/40 text-amber-100",
      )}
    >
      {children}
    </span>
  );
}
