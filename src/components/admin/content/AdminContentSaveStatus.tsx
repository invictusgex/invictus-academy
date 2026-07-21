type AdminContentSaveStatusProps = {
  status: "idle" | "saving" | "saved" | "error";
};

export function AdminContentSaveStatus({
  status,
}: AdminContentSaveStatusProps) {
  if (status === "idle") {
    return null;
  }

  if (status === "saving") {
    return (
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">
        Guardando...
      </p>
    );
  }

  if (status === "saved") {
    return (
      <p className="text-sm font-semibold text-[var(--color-cyan)]">
        Cambios guardados correctamente.
      </p>
    );
  }

  return (
    <p className="text-sm font-medium text-red-200">
      Revisa los datos antes de guardar.
    </p>
  );
}
