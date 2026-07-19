type LearningObjectivesProps = {
  objectives: string[];
};

export function LearningObjectives({ objectives }: LearningObjectivesProps) {
  if (objectives.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-white">
        Competencias que desarrollarás
      </h2>
      <ol className="mt-5 grid gap-3 text-sm leading-6 text-[var(--color-text-secondary)] sm:grid-cols-2">
        {objectives.map((objective, index) => (
          <li key={objective} className="flex gap-3">
            <span className="font-semibold text-[var(--color-cyan)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 break-words">{objective}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
