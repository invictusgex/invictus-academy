import { ProgressBar } from "@/components/ui/progress-bar";

type StudentProgressSummaryProps = {
  completedModules: number;
  percentage: number;
  statusLabel: string;
  totalModules: number;
};

export function StudentProgressSummary({
  completedModules,
  percentage,
  statusLabel,
  totalModules,
}: StudentProgressSummaryProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Progreso general
          </p>
          <p className="mt-3 text-5xl font-semibold leading-none text-white sm:text-6xl">
            {percentage} %
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            {completedModules} de {totalModules} modulos completados.
          </p>
        </div>
        <p className="w-fit rounded-full border border-cyan-200/30 bg-cyan-200/[0.04] px-3 py-1 text-sm font-semibold text-[var(--color-cyan)]">
          {statusLabel}
        </p>
      </div>
      <div className="mt-6">
        <ProgressBar label={statusLabel} value={percentage} />
      </div>
    </div>
  );
}
