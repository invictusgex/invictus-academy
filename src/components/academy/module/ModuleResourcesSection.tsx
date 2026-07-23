import {
  StudentCard,
  StudentContentGrid,
  StudentEmptyState,
  StudentSection,
  StudentStatusBadge,
} from "@/components/student";
import type { ModuleResource } from "@/types/academy";

type ModuleResourcesSectionProps = {
  resourceUrls: Record<string, string>;
  resources: ModuleResource[];
};

const resourceTypeLabels: Record<NonNullable<ModuleResource["resourceType"]>, string> = {
  downloadable: "Descargable",
  link: "Enlace",
  other: "Recurso",
  pdf: "PDF",
  template: "Plantilla",
};

function getResourceTypeLabel(resource: ModuleResource) {
  return resource.resourceType ? resourceTypeLabels[resource.resourceType] : "Recurso";
}

function getResourceActionLabel(resource: ModuleResource) {
  if (resource.resourceType === "downloadable" || resource.resourceType === "pdf") {
    return "Descargar";
  }

  if (resource.resourceType === "link") {
    return "Abrir";
  }

  return "Ver recurso";
}

export function ModuleResourcesSection({
  resourceUrls,
  resources,
}: ModuleResourcesSectionProps) {
  return (
    <StudentSection
      description="Material complementario asociado directamente a este modulo."
      title="Recursos"
    >
      {resources.length > 0 ? (
        <StudentContentGrid columns={2}>
          {resources.map((resource) => {
            const resourceUrl = resourceUrls[resource.id];

            return (
              <StudentCard
                className="flex min-h-full flex-col"
                key={resource.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <StudentStatusBadge tone="info">
                      {getResourceTypeLabel(resource)}
                    </StudentStatusBadge>
                    <h3 className="mt-4 text-balance text-lg font-semibold text-white">
                      {resource.title}
                    </h3>
                  </div>
                </div>
                {resource.description ? (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {resource.description}
                  </p>
                ) : null}
                {resourceUrl ? (
                  <a
                    className="mt-auto inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-fit motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    href={resourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {getResourceActionLabel(resource)}
                  </a>
                ) : (
                  <p className="mt-auto rounded-full border border-[var(--color-border)] px-3 py-2 text-center text-sm text-[var(--color-text-muted)] sm:w-fit">
                    Recurso no disponible
                  </p>
                )}
              </StudentCard>
            );
          })}
        </StudentContentGrid>
      ) : (
        <StudentEmptyState title="Este modulo aun no tiene recursos disponibles.">
          Los materiales complementarios apareceran aqui cuando sean publicados.
        </StudentEmptyState>
      )}
    </StudentSection>
  );
}
