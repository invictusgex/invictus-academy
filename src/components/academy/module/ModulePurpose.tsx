type ModulePurposeProps = {
  purpose?: string;
};

export function ModulePurpose({ purpose }: ModulePurposeProps) {
  if (!purpose) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-white">
        Propósito del módulo
      </h2>
      <p className="mt-4 max-w-3xl break-words text-base leading-7 text-[var(--color-text-secondary)]">
        {purpose}
      </p>
    </section>
  );
}
