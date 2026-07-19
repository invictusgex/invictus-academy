import type { ModuleResource } from "@/types/academy";

type ModuleResourcesProps = {
  resources: ModuleResource[];
};

export function ModuleResources({ resources }: ModuleResourcesProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-white">
        Recursos profesionales
      </h2>
      <ul className="mt-5 grid gap-3">
        {resources.map((resource) => (
          <li
            key={resource.id}
            className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="min-w-0 break-words text-sm font-medium text-white">
              {resource.title}
            </p>
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            >
              Abrir recurso
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
