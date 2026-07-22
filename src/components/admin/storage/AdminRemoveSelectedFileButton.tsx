type AdminRemoveSelectedFileButtonProps = {
  disabled?: boolean;
  onClick: () => void;
};

export function AdminRemoveSelectedFileButton({
  disabled = false,
  onClick,
}: AdminRemoveSelectedFileButtonProps) {
  return (
    <button
      className="inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-xs font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      Quitar seleccion
    </button>
  );
}
