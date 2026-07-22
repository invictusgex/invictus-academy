import type { ReactNode } from "react";

type AdminDangerZoneProps = {
  children: ReactNode;
  description?: string;
  title?: string;
};

export function AdminDangerZone({
  children,
  description,
  title = "Zona de peligro",
}: AdminDangerZoneProps) {
  return (
    <section className="rounded-2xl border border-red-200/40 bg-[var(--color-panel-bg)] p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          {description}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
