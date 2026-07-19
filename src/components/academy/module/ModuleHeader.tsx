import type { ModuleAvailability } from "@/types/academy";
import { formatModuleAvailabilityLabel } from "@/utils/module-availability";

type ModuleHeaderProps = {
  number: number;
  title: string;
  description: string;
  availability: ModuleAvailability;
  competenciesCount: number;
};

export function ModuleHeader({
  number,
  title,
  description,
  availability,
  competenciesCount,
}: ModuleHeaderProps) {
  const formattedModuleNumber = String(number).padStart(2, "0");

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8 lg:p-10">
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Módulo {formattedModuleNumber}
      </p>
      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <h1 className="break-words text-3xl font-semibold text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-5 break-words text-base leading-7 text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-[var(--color-cyan-line)] px-3 py-1 font-medium text-[var(--color-cyan)]">
            {formatModuleAvailabilityLabel(availability)}
          </span>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-text-secondary)]">
            {competenciesCount} competencias
          </span>
        </div>
      </div>
    </section>
  );
}
