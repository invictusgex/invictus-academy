import { ProgressBar } from "@/components/ui/progress-bar";

type StudentProgramOverviewProps = {
  completedModules: number;
  percentage: number;
  statusLabel: string;
  totalModules: number;
};

export function StudentProgramOverview({
  completedModules,
  percentage,
  statusLabel,
  totalModules,
}: StudentProgramOverviewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Progreso del programa
            </p>
            <p className="mt-3 text-5xl font-semibold leading-none text-white sm:text-6xl">
              {percentage} %
            </p>
          </div>
          <p className="w-fit rounded-full border border-cyan-200/30 bg-cyan-200/[0.04] px-3 py-1 text-sm font-semibold text-[var(--color-cyan)]">
            {statusLabel}
          </p>
        </div>
        <div className="mt-6">
          <ProgressBar label={statusLabel} value={percentage} />
        </div>
      </article>

      <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 sm:p-6">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Modulos
        </p>
        <p className="mt-3 text-4xl font-semibold leading-none text-white">
          {completedModules}/{totalModules}
        </p>
        <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
          Modulos completados dentro del contenido disponible.
        </p>
      </article>
    </div>
  );
}
