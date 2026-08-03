import Link from "next/link";

type NavigationModule = {
  id: string;
  number: number;
  title: string;
};

type StudentModuleNavigationProps = {
  nextModule?: NavigationModule;
  previousModule?: NavigationModule;
};

export function StudentModuleNavigation({
  nextModule,
  previousModule,
}: StudentModuleNavigationProps) {
  return (
    <nav
      aria-label="Navegación entre etapas"
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-7 lg:p-8"
    >
      <h2 className="text-2xl font-semibold text-white">Recorrido</h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {previousModule ? (
          <Link
            className="flex min-h-24 min-w-0 flex-col justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            href={`/academy/programa/${previousModule.id}`}
          >
            <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
              Etapa anterior
            </span>
            <span className="mt-2 break-words text-sm font-semibold text-white">
              {previousModule.title}
            </span>
          </Link>
        ) : (
          <div className="flex min-h-24 min-w-0 flex-col justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm text-[var(--color-text-muted)]">
            No hay etapa anterior.
          </div>
        )}

        <Link
          className="flex min-h-24 min-w-0 flex-col justify-center rounded-2xl border border-cyan-200/30 bg-cyan-200/[0.04] p-4 text-center transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          href="/academy/programa"
        >
          <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
            Programa
          </span>
          <span className="mt-2 text-sm font-semibold text-white">
            Volver al programa
          </span>
        </Link>

        {nextModule ? (
          <Link
            className="flex min-h-24 min-w-0 flex-col justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-cyan)] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            href={`/academy/programa/${nextModule.id}`}
          >
            <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
              Siguiente etapa
            </span>
            <span className="mt-2 break-words text-sm font-semibold text-white">
              {nextModule.title}
            </span>
          </Link>
        ) : (
          <div className="flex min-h-24 min-w-0 flex-col justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm text-[var(--color-text-muted)]">
            No hay siguiente etapa.
          </div>
        )}
      </div>
    </nav>
  );
}
