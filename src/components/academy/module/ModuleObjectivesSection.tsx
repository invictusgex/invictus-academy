import {
  StudentCard,
  StudentContentGrid,
  StudentEmptyState,
  StudentSection,
} from "@/components/student";

type ModuleObjectivesSectionProps = {
  objectives: string[];
};

export function ModuleObjectivesSection({
  objectives,
}: ModuleObjectivesSectionProps) {
  return (
    <StudentSection
      description="Competencias que orientan el estudio de este modulo."
      title="Objetivos del modulo"
    >
      {objectives.length > 0 ? (
        <StudentContentGrid columns={2}>
          {objectives.map((objective, index) => (
            <StudentCard
              className="flex gap-4"
              key={objective}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-200/30 text-sm font-semibold text-[var(--color-cyan)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="min-w-0 break-words text-sm leading-6 text-[var(--color-text-secondary)]">
                {objective}
              </p>
            </StudentCard>
          ))}
        </StudentContentGrid>
      ) : (
        <StudentEmptyState title="Este modulo aun no tiene objetivos publicados.">
          Los objetivos apareceran aqui cuando el contenido sea publicado.
        </StudentEmptyState>
      )}
    </StudentSection>
  );
}
