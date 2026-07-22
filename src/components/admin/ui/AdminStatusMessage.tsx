import type { ReactNode } from "react";

type AdminStatusMessageProps = {
  children: ReactNode;
  tone?: "error" | "info" | "success" | "warning";
};

export function AdminStatusMessage({
  children,
  tone = "info",
}: AdminStatusMessageProps) {
  const toneClass =
    tone === "error"
      ? "border-red-200/40 text-red-200"
      : tone === "success"
        ? "border-emerald-200/40 text-emerald-200"
        : tone === "warning"
          ? "border-amber-200/40 text-amber-100"
          : "border-[var(--color-border)] text-[var(--color-text-secondary)]";

  return (
    <p
      aria-live={tone === "info" ? undefined : "polite"}
      className={`rounded-xl border bg-[var(--color-card-bg)] p-4 text-sm leading-6 ${toneClass}`}
    >
      {children}
    </p>
  );
}
