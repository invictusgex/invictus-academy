"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardHeroProps = {
  userName: string;
};

function getSpanishGreeting(date: Date) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Buenos días";
  }

  if (hour >= 12 && hour < 19) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

export function DashboardHero({ userName }: DashboardHeroProps) {
  const [greeting, setGreeting] = useState("Bienvenido");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setGreeting(getSpanishGreeting(new Date()));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8 lg:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-[rgba(34,211,238,0.08)] blur-3xl"
      />
      <div className="relative max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Formación
        </p>
        <h1 className="mt-5 text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
          {greeting},{" "}
          <span className="text-[var(--color-cyan)]">{userName}</span>.
        </h1>
        <p className="mt-5 text-lg leading-8 text-[var(--color-text-secondary)]">
          Bienvenido a Invictus Trading Academy.
        </p>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-text-primary)]">
          La disciplina construye consistencia.
          <br />
          La consistencia fortalece el proceso.
        </p>
        <Link
          href="/academy/programa"
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        >
          Ingresar al programa
        </Link>
      </div>
    </section>
  );
}
