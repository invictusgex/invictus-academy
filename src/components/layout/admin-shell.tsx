import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";

type AdminShellProps = {
  children: ReactNode;
};

const adminNavigation = [
  { href: "/admin", label: "Resumen", enabled: true },
  { href: "/admin/students", label: "Alumnos", enabled: true },
  { href: "/admin/access", label: "Accesos", enabled: true },
  { href: "/admin/content", label: "Contenido", enabled: true },
  { href: "/admin/productos", label: "Productos", enabled: false },
];

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)] lg:flex">
      <aside className="flex w-full flex-col border-b border-[var(--color-border)] bg-[var(--color-panel-bg)] px-5 py-5 lg:min-h-screen lg:w-72 lg:border-r lg:border-b-0 lg:px-6 lg:py-7">
        <Link
          href="/academy"
          className="block text-sm font-semibold tracking-[0.12em] text-white uppercase"
        >
          Invictus Trading Academy
        </Link>
        <p className="mt-2 text-xs font-medium tracking-[0.16em] text-[var(--color-cyan)] uppercase">
          Administración
        </p>

        <nav
          aria-label="Navegación administrativa"
          className="mt-6 grid gap-2"
        >
          {adminNavigation.map((item) =>
            item.enabled ? (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-hover-bg)] px-3 py-2.5 text-sm font-medium text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)]"
              >
                {item.label} · Próximamente
              </span>
            ),
          )}
        </nav>

        <div className="mt-6 lg:mt-auto">
          <LogoutButton />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-[var(--color-border)] px-5 py-6 lg:px-8">
          <p className="text-2xl font-semibold text-white sm:text-3xl">
            Panel administrativo
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Gestión interna de Invictus Trading Academy.
          </p>
        </header>

        <main className="mx-auto w-full max-w-6xl px-5 pt-6 pb-16 sm:px-6 sm:pt-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
