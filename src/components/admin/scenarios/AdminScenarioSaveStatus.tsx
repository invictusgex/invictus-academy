type AdminScenarioSaveStatusProps = {
  status: "error" | "idle" | "saved" | "saving";
};

export function AdminScenarioSaveStatus({
  status,
}: AdminScenarioSaveStatusProps) {
  if (status === "saving") {
    return (
      <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
        Guardando...
      </p>
    );
  }

  if (status === "saved") {
    return (
      <p className="text-sm font-semibold text-[var(--color-cyan)]">
        Cambios guardados.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm font-semibold text-red-200">
        Revisa los campos marcados.
      </p>
    );
  }

  return null;
}
