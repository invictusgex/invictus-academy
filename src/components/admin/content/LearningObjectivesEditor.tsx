type LearningObjectivesEditorProps = {
  disabled: boolean;
  onChange: (objectives: string[]) => void;
  objectives: string[];
};

export function LearningObjectivesEditor({
  disabled,
  objectives,
  onChange,
}: LearningObjectivesEditorProps) {
  function updateObjective(index: number, value: string) {
    onChange(
      objectives.map((objective, currentIndex) =>
        currentIndex === index ? value : objective,
      ),
    );
  }

  function addObjective() {
    onChange([...objectives, ""]);
  }

  function removeObjective(index: number) {
    onChange(objectives.filter((_, currentIndex) => currentIndex !== index));
  }

  function moveObjective(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= objectives.length) {
      return;
    }

    const nextObjectives = [...objectives];
    const currentObjective = nextObjectives[index];
    nextObjectives[index] = nextObjectives[nextIndex];
    nextObjectives[nextIndex] = currentObjective;
    onChange(nextObjectives);
  }

  return (
    <div className="grid gap-3">
      {objectives.map((objective, index) => (
        <div
          className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
          key={index}
        >
          <label className="grid gap-2 text-sm font-medium text-white">
            Objetivo {index + 1}
            <input
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
              disabled={disabled}
              maxLength={180}
              onChange={(event) => updateObjective(index, event.target.value)}
              type="text"
              value={objective}
            />
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <button
              className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled || index === 0}
              onClick={() => moveObjective(index, -1)}
              type="button"
            >
              Subir
            </button>
            <button
              className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled || index === objectives.length - 1}
              onClick={() => moveObjective(index, 1)}
              type="button"
            >
              Bajar
            </button>
            <button
              className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-red-200 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
              onClick={() => removeObjective(index)}
              type="button"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
      {objectives.length === 0 ? (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm text-[var(--color-text-secondary)]">
          No hay objetivos registrados.
        </p>
      ) : null}
      <button
        className="min-h-10 w-fit rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || objectives.length >= 20}
        onClick={addObjective}
        type="button"
      >
        Agregar objetivo
      </button>
    </div>
  );
}
