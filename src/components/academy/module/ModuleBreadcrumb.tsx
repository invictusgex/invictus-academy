import Link from "next/link";

type ModuleBreadcrumbProps = {
  moduleNumber: number;
};

export function ModuleBreadcrumb({ moduleNumber }: ModuleBreadcrumbProps) {
  const formattedModuleNumber = String(moduleNumber).padStart(2, "0");

  return (
    <nav aria-label="Navegación contextual" className="text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[var(--color-text-muted)]">
        <li>
          <Link
            href="/academy"
            className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Inicio
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            href="/academy/programa"
            className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Programa de Formación
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="break-words text-white">
          Módulo {formattedModuleNumber}
        </li>
      </ol>
    </nav>
  );
}
