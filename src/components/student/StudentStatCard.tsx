import type { ReactNode } from "react";

import { StudentCard } from "@/components/student/StudentCard";

type StudentStatCardProps = {
  caption?: string;
  icon?: ReactNode;
  label: string;
  value: string;
};

export function StudentStatCard({
  caption,
  icon,
  label,
  value,
}: StudentStatCardProps) {
  return (
    <StudentCard className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold leading-none text-white">
            {value}
          </p>
        </div>
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-cyan)]">
            {icon}
          </div>
        ) : null}
      </div>
      {caption ? (
        <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
          {caption}
        </p>
      ) : null}
    </StudentCard>
  );
}
