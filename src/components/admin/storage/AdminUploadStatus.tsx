type AdminUploadStatusProps = {
  message: string | null;
  status: "error" | "idle" | "success" | "uploading" | "validating";
};

export function AdminUploadStatus({ message, status }: AdminUploadStatusProps) {
  if (!message) {
    return null;
  }

  const colorClass =
    status === "error"
      ? "text-red-300"
      : status === "success"
        ? "text-emerald-300"
        : "text-[var(--color-text-secondary)]";

  return (
    <p aria-live="polite" className={`text-xs ${colorClass}`}>
      {message}
    </p>
  );
}
