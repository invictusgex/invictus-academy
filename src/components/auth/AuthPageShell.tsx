import Image from "next/image";
import Link from "next/link";

import { PublicBackgroundField } from "@/components/public/PublicBackgroundField";
import { PublicSiteMotion } from "@/components/public/PublicSiteMotion";

type AuthPageShellProps = {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
};

export function AuthPageShell({
  children,
  description,
  eyebrow,
  title,
}: AuthPageShellProps) {
  return (
    <main className="public-site relative flex min-h-screen min-w-0 flex-1 items-center justify-center overflow-hidden bg-[var(--color-page-bg)] px-4 py-16 text-[var(--color-text-primary)] sm:px-5">
      <PublicSiteMotion />
      <PublicBackgroundField />
      <section
        className="public-glass-panel public-mobile-copy z-10 w-full min-w-0 p-6 sm:max-w-md sm:p-8"
        style={{ maxWidth: "min(28rem, calc(100vw - 2rem))" }}
      >
        <Link
          className="inline-flex max-w-full min-w-0 items-center gap-3 text-sm font-semibold tracking-[0.12em] text-white uppercase transition hover:text-[var(--color-cyan-hover)] sm:tracking-[0.18em]"
          href="/"
        >
          <Image
            alt=""
            aria-hidden="true"
            className="h-9 w-9 rounded-full object-contain"
            height={36}
            src="/brand/invictus-gex-logo.png"
            width={36}
          />
          <span className="min-w-0 break-words">Invictus GEX</span>
        </Link>
        <p className="mt-8 break-words text-sm font-semibold tracking-[0.12em] text-[var(--color-cyan)] uppercase sm:tracking-[0.18em]">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          {description}
        </p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
