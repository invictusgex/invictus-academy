import Link from "next/link";

import { formationCtaHref } from "@/config/public-cta";
import {
  publicFormationJourney,
  publicProgramAudience,
  publicProgramNonAudience,
} from "@/content/public-program";
import type { Course } from "@/types/academy";

type PublicLandingProps = {
  course: Course;
};

const principles = [
  {
    title: "Criterio antes que impulso",
    description:
      "El programa forma una manera de leer condiciones antes de evaluar cualquier decision.",
  },
  {
    title: "Evidencia antes que opinion",
    description:
      "La lectura se apoya en contexto, liquidez, volumen, exposicion gamma y riesgo.",
  },
  {
    title: "Proceso antes que resultado aislado",
    description:
      "Cada etapa busca que el participante pueda preparar, aplicar y revisar su criterio.",
  },
];

const mentorshipEvidence = [
  "Dudas que aparecen durante la formacion.",
  "Ejemplos de mercado observados por el participante.",
  "Reflexiones sobre decisiones, contexto y riesgo.",
  "Practica documentada para orientar una conversacion individual.",
];

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
      <a
        href="#inicio"
        className="max-w-[13rem] text-xs font-semibold tracking-[0.12em] text-white uppercase sm:max-w-none sm:text-sm"
      >
        Invictus GEX
      </a>
      <nav
        aria-label="Navegacion principal"
        className="hidden items-center gap-6 text-sm text-[var(--color-text-secondary)] md:flex"
      >
        <a className="transition hover:text-white" href="#recorrido">
          Recorrido
        </a>
        <a className="transition hover:text-white" href="#mentoria">
          Mentoria
        </a>
        <a className="transition hover:text-white" href="#perfil">
          Perfil
        </a>
      </nav>
      <Link
        href="/academy"
        className="shrink-0 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
      >
        Acceder
      </Link>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-16 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 lg:px-8 lg:pt-16 lg:pb-18">
      <div className="max-w-[45rem]">
        <p className="mb-5 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-[var(--color-cyan)] uppercase">
          Programa de formacion profesional
        </p>
        <h1 className="max-w-[44rem] text-4xl leading-tight font-semibold text-balance text-white sm:text-5xl lg:text-[3.65rem] lg:leading-[1.05]">
          Invictus GEX forma criterio profesional para leer el mercado.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)]">
          No ingresas a una plataforma de videos ni a una compra aislada.
          Ingresas a un proceso estructurado de formacion, practica,
          preparacion individual y consolidacion del criterio.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/programa"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Conocer el programa
          </Link>
          <a
            href="#recorrido"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-border)] px-6 text-sm font-semibold text-white transition hover:border-[var(--color-blue)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Ver el recorrido
          </a>
        </div>
      </div>

      <aside
        aria-label="Sintesis visual del proceso de formacion"
        className="rounded-xl border border-[var(--color-border)] bg-[linear-gradient(180deg,var(--color-panel-bg),var(--color-card-bg))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6 lg:p-7"
      >
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-chart-bg)] p-5">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Proceso Invictus GEX
          </p>
          <div className="mt-6 grid gap-3">
            {publicFormationJourney.slice(0, 5).map((step, index) => (
              <div
                className="flex items-center gap-3 rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-chart-surface)] p-3"
                key={step}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-cyan)] text-xs font-semibold text-[var(--color-cyan)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-white">{step}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-[var(--color-text-secondary)]">
            La mentoría no aparece como un complemento. Es la etapa que se
            prepara con evidencia desde el inicio del programa.
          </p>
        </div>
      </aside>
    </section>
  );
}

function PositioningSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Que estas iniciando
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Un entorno profesional para ordenar como interpretas, practicas y
            revisas el mercado.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)]">
            Invictus GEX no se presenta como una coleccion de lecciones. Su
            valor esta en guiar al participante por una secuencia que convierte
            informacion dispersa en criterio, evidencia y preparacion.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {principles.map((principle) => (
            <article
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6"
              key={principle.title}
            >
              <h3 className="text-xl font-semibold text-white">
                {principle.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                {principle.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section id="recorrido" className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Como se desarrolla tu formacion
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Un recorrido claro desde el ingreso hasta la consolidacion.
          </h2>
        </div>
        <Link
          href="/programa"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        >
          Ver estructura completa
        </Link>
      </div>
      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {publicFormationJourney.map((step, index) => (
          <li
            className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
            key={step}
          >
            <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-3 break-words text-sm leading-5 font-semibold text-white">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function MentorshipSection() {
  return (
    <section
      id="mentoria"
      className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            La mentoria comienza desde el primer modulo
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            La conversacion individual se prepara con tu propio proceso.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)]">
            Durante la formacion, cada participante construye evidencia sobre
            lo que comprende, lo que necesita revisar y como aplica la
            metodologia. Esa informacion permite que la mentoria sea precisa,
            personal y orientada al criterio real del alumno.
          </p>
        </div>
        <div className="grid gap-3">
          {mentorshipEvidence.map((item) => (
            <p
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]"
              key={item}
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramPreview({ course }: PublicLandingProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Estructura academica
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            {course.title}
          </h2>
        </div>
        <Link
          href="/programa"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        >
          Conocer el programa
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {course.modules.map((academyModule) => (
          <article
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5"
            key={academyModule.id}
          >
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
              Modulo {academyModule.number}
            </p>
            <h3 className="mt-3 text-xl font-semibold text-white">
              {academyModule.title}
            </h3>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              {academyModule.description}
            </p>
            <Link
              href={`/programa#${academyModule.id}`}
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            >
              Revisar modulo
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section
      id="perfil"
      className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
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
        <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
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
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8 lg:p-10">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Ingreso al programa
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white">
          Forma parte de un proceso serio de preparacion, practica y mentoria.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Invictus GEX esta disenado para quienes quieren desarrollar criterio
          profesional sin promesas financieras, sin presion comercial y sin
          depender de lecturas ajenas.
        </p>
        <Link
          href={formationCtaHref}
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        >
          Iniciar mi formacion
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p>Invictus GEX © {currentYear}</p>
      <p>Formacion profesional en lectura de mercado basada en datos.</p>
    </footer>
  );
}

export function PublicLanding({ course }: PublicLandingProps) {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <Header />
      <main id="inicio">
        <Hero />
        <PositioningSection />
        <JourneySection />
        <MentorshipSection />
        <ProgramPreview course={course} />
        <AudienceSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
