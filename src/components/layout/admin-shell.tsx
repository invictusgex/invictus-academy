import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { PublicBackgroundField } from "@/components/public/PublicBackgroundField";
import { PublicSiteMotion } from "@/components/public/PublicSiteMotion";

type AdminShellProps = {
  children: ReactNode;
};

const adminNavigation = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/students", label: "Alumnos" },
  { href: "/admin/access", label: "Accesos" },
  { href: "/admin/commercial", label: "Promoción" },
  { href: "/admin/content", label: "Contenido" },
  { href: "/admin/scenarios", label: "Biblioteca de Escenarios" },
  { href: "/admin/mentorship", label: "Agenda de mentorías" },
];

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="public-site app-shell-surface relative min-h-screen overflow-x-hidden bg-[var(--color-page-bg)] text-[var(--color-text-primary)] lg:flex">
      <PublicSiteMotion />
      <PublicBackgroundField />
      <aside className="app-shell-sidebar relative z-20 flex w-full flex-col border-b border-[var(--color-border)] bg-[var(--color-panel-bg)] px-5 py-5 lg:min-h-screen lg:w-72 lg:border-r lg:border-b-0 lg:px-6 lg:py-7">
        <Link
          href="/academy"
          className="flex items-center gap-3 text-sm font-semibold tracking-[0.12em] text-white uppercase"
        >
          <Image
            alt=""
            aria-hidden="true"
            className="h-8 w-8 rounded-full object-contain"
            height={32}
            src="/brand/invictus-gex-logo.png"
            width={32}
          />
          <span>Invictus GEX</span>
        </Link>
        <p className="mt-2 text-xs font-medium tracking-[0.16em] text-[var(--color-cyan)] uppercase">
          Administración
        </p>

        <nav
          aria-label="Navegación administrativa"
          className="mt-6 grid gap-2"
        >
          {adminNavigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-hover-bg)] px-3 py-2.5 text-sm font-medium text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 lg:mt-auto">
          <LogoutButton />
        </div>
      </aside>

      <div className="relative z-10 min-w-0 flex-1">
        <header className="app-shell-header border-b border-[var(--color-border)] px-5 py-6 lg:px-8">
          <p className="text-2xl font-semibold text-white sm:text-3xl">
            Panel administrativo
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Gestión interna de Invictus GEX.
          </p>
        </header>

        <main className="mx-auto w-full max-w-6xl px-5 pt-6 pb-16 sm:px-6 sm:pt-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
