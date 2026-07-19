export function AcademyHeader() {
  return (
    <header className="flex flex-col gap-5 border-b border-[var(--color-border)] px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div>
        <p className="text-2xl font-semibold text-white sm:text-3xl">
          Centro de control
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Gestiona tu formación y accede al programa principal.
        </p>
      </div>

      <div
        aria-label="Avatar provisional IA"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card-bg)] text-sm font-semibold text-[var(--color-cyan)]"
      >
        IA
      </div>
    </header>
  );
}
