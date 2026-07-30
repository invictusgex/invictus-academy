import Link from "next/link";

export function AcademyEnrollmentEmptyState() {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 text-center sm:p-8">
      <div aria-hidden="true" className="mx-auto mb-4 h-px w-20 bg-cyan-200/25" />
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Academia
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
        Aun no tienes un programa activo
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
        Cuando adquieras una formacion, aparecera aqui junto con tu progreso y
        recursos.
      </p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          href="/programa"
        >
          Ver el programa
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          href="/oferta"
        >
          Ver la oferta
        </Link>
      </div>
    </section>
  );
}
