import Link from "next/link";

import { formationCtaHref } from "@/config/public-cta";
import type { Course } from "@/types/academy";

type PublicLandingProps = {
  course: Course;
};

const methodologyPrinciples = [
  {
    title: "Contexto antes que impulso",
    description:
      "Cada lectura parte de comprender el entorno antes de evaluar una posible decisión.",
  },
  {
    title: "Evidencia observable",
    description:
      "La metodología prioriza datos, niveles y comportamiento verificable sobre interpretaciones aisladas.",
  },
  {
    title: "Proceso repetible",
    description:
      "El objetivo es construir criterios consistentes, no depender de reacciones improvisadas.",
  },
  {
    title: "Riesgo como estructura",
    description:
      "La gestión del riesgo forma parte del análisis desde el inicio, no después de entrar al mercado.",
  },
];

const transformationSteps = [
  "Mentalidad",
  "Comprensión",
  "Regímenes",
  "Mapa",
  "Lectura",
  "Ejecución",
  "Profesionalización",
];

const invictusPrinciples = [
  "Pensar en escenarios antes que en predicciones.",
  "Separar información útil de ruido operativo.",
  "Esperar confirmación antes de actuar.",
  "Medir riesgo antes de buscar oportunidad.",
  "Construir criterio con práctica deliberada.",
];

const suitableProfiles = [
  "Personas que quieren estudiar el mercado con una estructura clara.",
  "Traders que buscan ordenar su lectura de liquidez, volumen y contexto.",
  "Alumnos dispuestos a desarrollar disciplina antes de acelerar ejecución.",
  "Operadores que prefieren evidencia y proceso por encima de señales rápidas.",
];

const unsuitableProfiles = [
  "Quienes buscan una sala de señales.",
  "Quienes esperan ganancias garantizadas.",
  "Quienes quieren operar sin estudiar contexto, riesgo y proceso.",
  "Quienes prefieren atajos sobre formación progresiva.",
];

const liquidityLevels = [
  { label: "Contexto", width: "76%", tone: "muted" },
  { label: "Liquidez", width: "92%", tone: "cyan" },
  { label: "Volumen", width: "58%", tone: "blue" },
  { label: "Riesgo", width: "84%", tone: "muted" },
];

const marketPoints = [
  "left-[14%] top-[62%]",
  "left-[31%] top-[44%]",
  "left-[48%] top-[53%]",
  "left-[67%] top-[32%]",
  "left-[82%] top-[46%]",
];

function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
      <a
        href="#inicio"
        className="max-w-[13rem] text-xs font-semibold tracking-[0.12em] text-white uppercase sm:max-w-none sm:text-sm"
      >
        Invictus Trading Academy
      </a>
      <nav
        aria-label="Navegación principal"
        className="hidden items-center gap-6 text-sm text-[var(--color-text-secondary)] md:flex"
      >
        <a className="transition hover:text-white" href="#metodologia">
          Metodología
        </a>
        <a className="transition hover:text-white" href="#programa">
          Programa
        </a>
        <a className="transition hover:text-white" href="#filosofia">
          Filosofía
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
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-8 lg:pt-16 lg:pb-18">
      <div className="max-w-[43rem]">
        <p className="mb-5 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-[var(--color-cyan)] uppercase">
          Formación basada en datos
        </p>
        <h1 className="max-w-[42rem] text-4xl leading-tight font-semibold text-balance text-white sm:text-5xl lg:text-[3.65rem] lg:leading-[1.05]">
          Trading basado en datos. No en opiniones.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)]">
          Invictus Trading Academy es una plataforma educativa para desarrollar
          lectura de mercado con estructura, evidencia y disciplina profesional.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/programa"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Conocer el programa
          </Link>
          <a
            href="#metodologia"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-border)] px-6 text-sm font-semibold text-white transition hover:border-[var(--color-blue)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Ver metodología
          </a>
        </div>
      </div>

      <aside
        aria-label="Representación visual de análisis de mercado"
        className="rounded-xl border border-[var(--color-border)] bg-[linear-gradient(180deg,var(--color-panel-bg),var(--color-card-bg))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6 lg:p-7"
      >
        <div className="market-panel relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-chart-bg)] p-5">
          <div className="relative z-10">
            <p className="text-sm font-medium text-[var(--color-cyan)]">
              Plataforma educativa en desarrollo.
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
              Un entorno preparado para estudiar liquidez, volumen, exposición
              gamma y gestión disciplinada del riesgo.
            </p>
          </div>

          <div
            aria-hidden="true"
            className="relative z-10 mt-8 h-64 rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-chart-surface)] p-5"
          >
            <div className="absolute inset-0 market-grid" />
            <div className="relative flex h-full flex-col justify-between">
              {liquidityLevels.map((level) => (
                <div key={level.label} className="relative">
                  <span
                    className={`block h-px rounded-full ${
                      level.tone === "cyan"
                        ? "bg-[var(--color-cyan-line)]"
                        : level.tone === "blue"
                          ? "bg-[var(--color-blue-line)]"
                          : "bg-[var(--color-muted-line)]"
                    }`}
                    style={{ width: level.width }}
                  />
                  <span className="mt-2 block text-[0.68rem] font-medium tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
                    {level.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="market-path absolute right-[9%] bottom-[22%] left-[11%] h-[44%] rounded-t-[58%] border-t border-r border-[var(--color-cyan-line)]" />
            {marketPoints.map((position) => (
              <span
                key={position}
                className={`absolute ${position} h-2.5 w-2.5 rounded-full border border-[var(--color-cyan)] bg-[var(--color-chart-bg)] shadow-[0_0_18px_rgba(34,211,238,0.24)]`}
              />
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            El problema
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Demasiada información sin contexto vuelve frágil la decisión.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)]">
            El mercado produce datos constantemente. Sin una estructura para
            interpretarlos, es fácil confundir ruido con oportunidad y opinión
            con análisis.
          </p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6">
            <h3 className="text-xl font-semibold text-white">
              Enfoque basado en opiniones
            </h3>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              Reacciona a titulares, sesgos, impulsos y lecturas aisladas sin
              validar el contexto completo.
            </p>
          </article>
          <article className="rounded-xl border border-[var(--color-cyan)] bg-[var(--color-card-bg)] p-6">
            <h3 className="text-xl font-semibold text-white">
              Enfoque basado en contexto
            </h3>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              Ordena la información, identifica condiciones, define escenarios
              y protege el proceso antes de ejecutar.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function MethodologySection() {
  return (
    <section id="metodologia" className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        ¿Qué hace diferente a Invictus?
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {methodologyPrinciples.map((principle) => (
          <article
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6"
            key={principle.title}
          >
            <h2 className="text-lg font-semibold text-white">
              {principle.title}
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              {principle.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TransformationSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          La transformación
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-7">
          {transformationSteps.map((step, index) => (
            <article
              className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
              key={step}
            >
              <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-3 text-base font-semibold text-white">
                {step}
              </h2>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhilosophySection() {
  return (
    <section id="filosofia" className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Filosofía Invictus
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Criterio, disciplina y lectura contextual.
          </h2>
        </div>
        <div className="grid gap-3">
          {invictusPrinciples.map((principle) => (
            <p
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]"
              key={principle}
            >
              {principle}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramPreview({ course }: PublicLandingProps) {
  return (
    <section
      id="programa"
      className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Vista previa del programa
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
                Módulo {academyModule.number}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {academyModule.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                {academyModule.description}
              </p>
              <Link
                href={`/programa#modulo-${academyModule.id}`}
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
              >
                Ver más
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
      <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          ¿Para quién es?
        </p>
        <ul className="mt-6 space-y-4">
          {suitableProfiles.map((profile) => (
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
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          ¿Para quién no es?
        </p>
        <ul className="mt-6 space-y-4">
          {unsuitableProfiles.map((profile) => (
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
    <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8 lg:p-10">
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white">
          Comienza a construir un proceso, no una colección de estrategias.
        </h2>
        <Link
          href={formationCtaHref}
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        >
          Comenzar mi formación
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p>Invictus Trading Academy © {currentYear}</p>
      <p>Educación financiera con enfoque analítico.</p>
    </footer>
  );
}

export function PublicLanding({ course }: PublicLandingProps) {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <Header />
      <main id="inicio">
        <Hero />
        <ProblemSection />
        <MethodologySection />
        <TransformationSection />
        <PhilosophySection />
        <ProgramPreview course={course} />
        <AudienceSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
