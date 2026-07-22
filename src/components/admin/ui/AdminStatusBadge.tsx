type AdminStatusBadgeProps = {
  tone?: "danger" | "neutral" | "success" | "warning";
  children: string;
};

export function AdminStatusBadge({
  children,
  tone = "neutral",
}: AdminStatusBadgeProps) {
  const toneClass =
    tone === "danger"
      ? "border-red-200/40 text-red-200"
      : tone === "success"
        ? "border-emerald-200/40 text-emerald-200"
        : tone === "warning"
          ? "border-amber-200/40 text-amber-100"
          : "border-[var(--color-border)] text-[var(--color-cyan)]";

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-semibold ${toneClass}`}
    >
      {children}
    </span>
  );
}
