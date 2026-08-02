import Link from "next/link";

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
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[var(--color-page-bg)] px-5 py-16">
      <section className="w-full max-w-md">
        <Link
          className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase transition hover:text-[var(--color-cyan-hover)]"
          href="/"
        >
          Invictus GEX
        </Link>
        <p className="mt-8 text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
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
