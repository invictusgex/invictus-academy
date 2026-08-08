import Link from "next/link";

import { formationCtaHref } from "@/config/public-cta";

type NoActiveProgramStateProps = {
  description: string;
};

export function NoActiveProgramState({ description }: NoActiveProgramStateProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 text-center sm:p-8">
      <div aria-hidden="true" className="mx-auto mb-4 h-px w-20 bg-cyan-200/25" />
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Acceso al programa
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
        Aún no tienes un programa activo
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-secondary)]">
        {description}
      </p>
      <Link
        className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        href={formationCtaHref}
      >
        Comenzar mi formación
      </Link>
    </section>
  );
}
