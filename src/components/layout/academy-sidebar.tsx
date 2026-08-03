"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAdminContext } from "@/contexts/AdminContext";
import type { AcademyNavItem } from "@/types/academy";
import { classNames } from "@/utils/class-names";

type AcademySidebarProps = {
  navigation: AcademyNavItem[];
};

export function AcademySidebar({ navigation }: AcademySidebarProps) {
  const { isAdmin } = useAdminContext();
  const pathname = usePathname();
  const visibleNavigation = isAdmin
    ? [...navigation, { href: "/admin", label: "Administración" }]
    : navigation;
  const currentNavigationIndex = visibleNavigation.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== "/academy" && pathname.startsWith(`${item.href}/`)),
  );

  return (
    <aside className="flex w-full flex-col border-b border-[var(--color-border)] bg-[var(--color-panel-bg)] px-5 py-5 lg:min-h-screen lg:w-72 lg:border-r lg:border-b-0 lg:px-6 lg:py-7">
      <div>
        <Link
          href="/"
          className="block text-sm font-semibold tracking-[0.12em] text-white uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
        >
          Invictus GEX
        </Link>
      </div>

      <nav
        aria-label="Navegación de academia"
        className="mt-6 grid gap-2 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-1"
      >
        {visibleNavigation.map((item, index) => {
          const isCurrentPage = index === currentNavigationIndex;

          return (
            <Link
              aria-current={isCurrentPage ? "page" : undefined}
              key={item.label}
              href={item.href}
              className={classNames(
                "min-w-0 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium break-words text-[var(--color-text-secondary)] transition",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]",
                "hover:border-[var(--color-border)] hover:bg-[var(--color-hover-bg)] hover:text-white",
                isCurrentPage &&
                  "border-[var(--color-border)] bg-[var(--color-hover-bg)] text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
