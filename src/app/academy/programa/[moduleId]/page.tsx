import Link from "next/link";
import { notFound } from "next/navigation";

import { AcademyShell } from "@/components/layout/academy-shell";
import { getAcademyModule, getProvisionalCourse } from "@/lib/academy-content";

type ModulePageProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AcademyModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const course = getProvisionalCourse();
  const academyModule = getAcademyModule(moduleId);

  if (!academyModule) {
    notFound();
  }

  const previousModule = course.modules[academyModule.number - 2];
  const nextModule = course.modules[academyModule.number];

  return (
    <AcademyShell>
      <nav aria-label="Migas de pan" className="mb-5 text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-[var(--color-text-muted)]">
          <li>
            <Link
              href="/academy/programa"
              className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            >
              Programa
            </Link>
          </li>
          <li aria-hidden="true">&gt;</li>
          <li aria-current="page" className="text-white">
            {academyModule.title}
          </li>
        </ol>
      </nav>

      <section className="mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              {academyModule.title}
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              {academyModule.title}
            </h1>
          </div>
          <span className="w-fit rounded-full border border-[var(--color-border)] px-3 py-1 text-sm font-medium text-[var(--color-text-muted)]">
            {academyModule.status}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-8">
        <div className="flex aspect-video min-h-56 items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 text-center">
          <p className="text-lg font-semibold text-white">
            {academyModule.video.placeholder}
          </p>
        </div>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Aquí se mostrará el contenido audiovisual y los recursos
          correspondientes a este módulo.
        </p>
      </section>

      <nav
        aria-label="Navegación entre módulos"
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          {previousModule ? (
            <Link
              href={`/academy/programa/${previousModule.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            >
              Módulo anterior: {previousModule.title}
            </Link>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/academy/programa"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Volver al programa
          </Link>
          {nextModule ? (
            <Link
              href={`/academy/programa/${nextModule.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            >
              Módulo siguiente: {nextModule.title}
            </Link>
          ) : null}
        </div>
      </nav>
    </AcademyShell>
  );
}
