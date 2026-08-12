import Image from "next/image";
import Link from "next/link";

import { PublicBackgroundField } from "@/components/public/PublicBackgroundField";
import { PublicSiteMotion } from "@/components/public/PublicSiteMotion";
import { PublicTikTokLink } from "@/components/public/PublicTikTokLink";
import { formationCtaHref } from "@/config/public-cta";
import { getSupportMailtoHref } from "@/config/site";
import {
  publicFormationJourney,
  publicGlobalCompetencies,
  publicMethodologySteps,
  publicProgramAudience,
  publicProgramModules,
  publicProgramNonAudience,
} from "@/content/public-program";
import type { Course } from "@/types/academy";

type PublicProgramPageProps = {
  course: Course;
};

const CONTACT_SUBJECT = "Consulta sobre Invictus GEX";

function PublicProgramHeader() {
  const contactHref = getSupportMailtoHref(CONTACT_SUBJECT);

  return (
    <header className="public-header mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="flex max-w-[13rem] items-center gap-3 text-xs font-semibold tracking-[0.12em] text-white uppercase transition hover:text-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:max-w-none sm:text-sm"
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
      <nav
        aria-label="Navegación del programa"
        className="hidden items-center gap-6 text-sm text-[var(--color-text-secondary)] md:flex"
      >
        <a className="transition hover:text-white" href="#recorrido">
          Recorrido
        </a>
        <a className="transition hover:text-white" href="#modulos">
          Módulos
        </a>
        <a className="transition hover:text-white" href={contactHref}>
          Contacto
        </a>
        <PublicTikTokLink />
      </nav>
      <div className="flex shrink-0 items-center gap-3">
        <a
          href={contactHref}
          className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] md:hidden"
        >
          Contacto
        </a>
        <div className="block md:hidden">
          <PublicTikTokLink />
        </div>
        <Link
          href="/"
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
        >
          <span className="sm:hidden">Inicio</span>
          <span className="hidden sm:inline">Volver al inicio</span>
        </Link>
      </div>
    </header>
  );
}

function ProgramHero({ course }: PublicProgramPageProps) {
  const stats = [
    `${course.modules.length} módulos`,
    "Proceso guiado",
    "Práctica con evidencia",
    "Mentoría privada en vivo 1 a 1",
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-14 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
      <div
        className="public-mobile-copy w-full sm:max-w-4xl"
        style={{ maxWidth: "min(56rem, calc(100vw - 2.5rem))" }}
      >
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Programa profesional Invictus GEX
        </p>
        <h1 className="mt-5 max-w-full text-[2.35rem] leading-tight font-semibold text-white sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
          Invictus GEX
        </h1>
        <p className="mt-6 max-w-full text-base leading-7 text-[var(--color-text-secondary)] sm:max-w-3xl sm:text-lg sm:leading-8">
          Una formación privada para desarrollar criterio profesional en
          lectura de mercado basada en datos. El recorrido construye
          fundamentos y culmina en una mentoría privada en vivo 1 a 1 con el
          mentor, preparada a partir de tu avance.
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <p
            className="public-glass-panel p-4 text-sm font-semibold text-white"
            key={stat}
          >
            {stat}
          </p>
        ))}
      </div>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href={formationCtaHref}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
        >
          Comenzar mi formación
        </Link>
        <a
          href="#modulos"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-border)] px-6 text-sm font-semibold text-white transition hover:border-[var(--color-blue)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
        >
          Explorar el programa
        </a>
      </div>
    </section>
  );
}

function JourneyIntro() {
  return (
    <section
      id="recorrido"
      className="public-flow-section"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Cómo se desarrolla tu formación
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            No revisas contenido aislado. Avanzas por una secuencia de
            preparación profesional.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)]">
            Cada etapa cumple una función: comprender, practicar, documentar y
            preparar una mentoría privada en vivo 1 a 1 con información
            concreta de tu recorrido.
          </p>
        </div>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          {publicFormationJourney.map((step, index) => (
            <li
              className="public-glass-panel p-4"
              key={step}
            >
              <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 break-words text-sm font-semibold text-white">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PublicModulesSection() {
  return (
    <section id="modulos" className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Estructura académica
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          Siete etapas para avanzar de interpretación a consolidación.
        </h2>
      </div>
      <div className="mt-8 space-y-5">
        {publicProgramModules.map((academyModule) => (
          <article
            className="public-glass-panel p-5 sm:p-6 lg:p-8"
            id={academyModule.id}
            key={academyModule.id}
          >
            <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
                  Módulo {academyModule.number}
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  {academyModule.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                  {academyModule.subtitle}
                </p>
                {academyModule.indicator ? (
                  <p className="mt-4 inline-flex rounded-full border border-[var(--color-cyan)] px-3 py-1 text-xs font-semibold text-[var(--color-cyan)]">
                    {academyModule.indicator}
                  </p>
                ) : null}
              </div>
              <div>
                <p className="text-base leading-7 text-[var(--color-text-secondary)]">
                  {academyModule.description}
                </p>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Criterios que desarrolla
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {academyModule.competencies.map((competency) => (
                        <li
                          className="text-sm leading-6 text-[var(--color-text-secondary)]"
                          key={competency}
                        >
                          {competency}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Al completar esta etapa
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {academyModule.result}
                    </p>
                  </div>
                </div>
                {academyModule.transition ? (
                  <p className="public-glass-panel mt-6 p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {academyModule.transition}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MethodologyBlock() {
  return (
    <section className="public-flow-section">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold text-white">
          La metodología integra cinco criterios profesionales.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {publicMethodologySteps.map((step, index) => (
            <article
              className="public-glass-panel p-5"
              key={step.title}
            >
              <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                {step.question}
              </p>
            </article>
          ))}
        </div>
        <p className="public-glass-panel public-glass-panel-accent mt-8 p-5 text-base font-semibold text-white">
          La decisión aparece al final de la lectura, no al comienzo.
        </p>
      </div>
    </section>
  );
}

function MentorshipPreparationBlock() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
      <div>
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Segunda etapa del Método Invictus
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          Tu avance permite una integración individual más profunda.
        </h2>
      </div>
      <p className="text-base leading-7 text-[var(--color-text-secondary)]">
        A medida que avanzas, documentas lecturas, ejemplos y puntos de
        integración. Esa evidencia permite trabajar cómo se relacionan
        Exposición Gamma, Mapa de Liquidez, Order Flow, Big Trades, CVD, Delta,
        Speed of Tape, VWAP y Perfil de Volumen dentro de una sola metodología.
      </p>
    </section>
  );
}

function CompetenciesBlock() {
  return (
    <section className="public-flow-section">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Lo que desarrollarás
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {publicGlobalCompetencies.map((competency) => (
            <p
              className="public-glass-panel p-4 text-sm leading-6 text-[var(--color-text-secondary)]"
              key={competency}
            >
              {competency}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceBlock() {
  return (
    <section id="perfil" className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
      <article className="public-glass-panel p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">
          Este programa es para ti si...
        </h2>
        <ul className="mt-6 space-y-4">
          {publicProgramAudience.map((profile) => (
            <li
              className="text-base leading-7 text-[var(--color-text-secondary)]"
              key={profile}
            >
              {profile}
            </li>
          ))}
        </ul>
      </article>
      <article className="public-glass-panel p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">
          Este programa probablemente no sea para ti si...
        </h2>
        <ul className="mt-6 space-y-4">
          {publicProgramNonAudience.map((profile) => (
            <li
              className="text-base leading-7 text-[var(--color-text-secondary)]"
              key={profile}
            >
              {profile}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="public-glass-panel p-6 sm:p-8 lg:p-10">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Siguiente paso
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white">
          Si este recorrido responde a lo que buscas, comienza tu formación.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Invictus GEX está diseñado para quienes quieren desarrollar criterio
          con estructura, práctica e integración metodológica.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href={formationCtaHref}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Comenzar mi formación
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-border)] px-6 text-sm font-semibold text-white transition hover:border-[var(--color-blue)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p>Invictus GEX</p>
      <p>Formación profesional en lectura de mercado basada en datos.</p>
    </footer>
  );
}

export function PublicProgramPage({ course }: PublicProgramPageProps) {
  return (
    <div className="public-site min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <PublicSiteMotion />
      <PublicProgramHeader />
      <main>
        <PublicBackgroundField />
        <ProgramHero course={course} />
        <JourneyIntro />
        <PublicModulesSection />
        <MethodologyBlock />
        <MentorshipPreparationBlock />
        <CompetenciesBlock />
        <AudienceBlock />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
