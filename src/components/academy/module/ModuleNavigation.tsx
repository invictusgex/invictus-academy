import Link from "next/link";

type NavigationModule = {
  id: string;
  number: number;
  title: string;
};

type ModuleNavigationProps = {
  previousModule?: NavigationModule;
  nextModule?: NavigationModule;
};

export function ModuleNavigation({
  previousModule,
  nextModule,
}: ModuleNavigationProps) {
  return (
    <nav
      aria-label="Navegación entre módulos"
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8"
    >
      {nextModule ? (
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Próxima etapa
          </p>
          <h2 className="mt-3 break-words text-2xl font-semibold text-white">
            Módulo {String(nextModule.number).padStart(2, "0")}
          </h2>
          <p className="mt-3 break-words text-base leading-7 text-[var(--color-text-secondary)]">
            {nextModule.title}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Etapa final
          </p>
          <h2 className="mt-3 break-words text-2xl font-semibold text-white">
            Has llegado al último módulo disponible del programa.
          </h2>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {previousModule ? (
            <Link
              href={`/academy/programa/${previousModule.id}`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-center text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
            >
              Módulo anterior: {previousModule.title}
            </Link>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/academy/programa"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-center text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
          >
            Volver al programa
          </Link>
          {nextModule ? (
            <Link
              href={`/academy/programa/${nextModule.id}`}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-center text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
            >
              Ingresar al siguiente módulo
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
