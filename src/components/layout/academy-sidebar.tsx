import Link from "next/link";

import type { AcademyNavItem } from "@/types/academy";
import { classNames } from "@/utils/class-names";

type AcademySidebarProps = {
  navigation: AcademyNavItem[];
};

export function AcademySidebar({ navigation }: AcademySidebarProps) {
  return (
    <aside className="flex w-full flex-col border-b border-[var(--color-border)] bg-[var(--color-panel-bg)] px-5 py-5 lg:min-h-screen lg:w-72 lg:border-r lg:border-b-0 lg:px-6 lg:py-7">
      <div>
        <Link
          href="/"
          className="block text-sm font-semibold tracking-[0.12em] text-white uppercase"
        >
          Invictus Trading Academy
        </Link>
      </div>

      <nav
        aria-label="Navegación de academia"
        className="mt-6 grid gap-2 sm:grid-cols-4 lg:grid-cols-1"
      >
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={classNames(
              "rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition",
              "hover:border-[var(--color-border)] hover:bg-[var(--color-hover-bg)] hover:text-white",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 lg:mt-auto">
        <button
          type="button"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-left text-sm font-medium text-[var(--color-text-muted)]"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
