import Link from "next/link";

import { formationCtaHref } from "@/config/public-cta";
import { getSupportMailtoHref } from "@/config/site";
import {
  publicProgramAudience,
  publicProgramNonAudience,
} from "@/content/public-program";
import type { Course } from "@/types/academy";

type PublicLandingProps = {
  course: Course;
};

const principles = [
  {
    title: "Criterio",
    description:
      "Una manera ordenada de leer condiciones antes de evaluar cualquier decisión.",
  },
  {
    title: "Evidencia",
    description:
      "Contexto, liquidez, volumen, exposición gamma y riesgo dentro de una misma lectura.",
  },
  {
    title: "Proceso",
    description:
      "Un avance progresivo para preparar, aplicar, revisar y consolidar criterio.",
  },
];

const mentorshipEvidence = [
  "Lecturas documentadas que revelan cómo construyes contexto.",
  "Ejemplos reales donde liquidez, flujo y exposición gamma empiezan a relacionarse.",
  "Observaciones sobre decisión, riesgo y condiciones previas a la ejecución.",
  "Evidencia de práctica para integrar la metodología a tu proceso.",
];

const interpretationShifts = [
  {
    before: "Observabas movimientos.",
    after: "Ahora comprenderás procesos.",
  },
  {
    before: "Veías herramientas independientes.",
    after: "Ahora interpretarás cómo trabajan juntas.",
  },
  {
    before: "Buscabas entradas.",
    after: "Ahora construirás contexto.",
  },
  {
    before: "Dependías de confirmaciones.",
    after: "Ahora desarrollarás criterio profesional.",
  },
];

const learningPaths = [
  {
    title: "Aprender herramientas",
    steps: [
      "Más información",
      "Más indicadores",
      "Más complejidad",
      "Las decisiones siguen dependiendo de la interpretación del momento.",
    ],
  },
  {
    title: "Desarrollar criterio",
    steps: [
      "Comprender relaciones",
      "Construir contexto",
      "Interpretar el mercado como un sistema",
      "Tomar decisiones con una metodología consistente.",
    ],
  },
];

const academicMap = [
  {
    title: "Comprendes el programa",
    description:
      "Conoces cómo se desarrollará tu formación y qué puedes esperar de cada etapa antes de comenzar.",
  },
  {
    title: "Comienzas tu formación",
    description:
      "Accedes al programa y comienzas a desarrollar una metodología para interpretar el mercado mediante un proceso estructurado.",
  },
  {
    title: "Documentas tu proceso",
    description:
      "Registra observaciones, lecturas y ejemplos reales que servirán para preparar la integración metodológica.",
  },
  {
    title: "Recibes tu mentoría personalizada",
    description:
      "La segunda etapa del Método Invictus utiliza tu recorrido para profundizar e integrar la metodología.",
  },
];

const CONTACT_SUBJECT = "Consulta sobre Invictus GEX";

function Header() {
  const contactHref = getSupportMailtoHref(CONTACT_SUBJECT);

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
      <a
        href="#inicio"
        className="max-w-[13rem] text-xs font-semibold tracking-[0.12em] text-white uppercase sm:max-w-none sm:text-sm"
      >
        Invictus GEX
      </a>
      <nav
        aria-label="Navegación principal"
        className="hidden items-center gap-6 text-sm text-[var(--color-text-secondary)] md:flex"
      >
        <a className="transition hover:text-white" href="#recorrido">
          Recorrido
        </a>
        <a className="transition hover:text-white" href="#mentoria">
          Mentoría
        </a>
        <a className="transition hover:text-white" href={contactHref}>
          Contacto
        </a>
      </nav>
      <div className="flex shrink-0 items-center gap-3">
        <a
          href={contactHref}
          className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] md:hidden"
        >
          Contacto
        </a>
        <Link
          href="/academy"
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
        >
          Acceder
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-16 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 lg:px-8 lg:pt-16 lg:pb-18">
      <div className="max-w-[45rem]">
        <p className="mb-6 text-sm font-semibold tracking-[0.2em] text-[var(--color-cyan)] uppercase">
          El problema no es aprender más
        </p>
        <h1 className="max-w-[44rem] text-4xl leading-tight font-semibold text-balance text-white sm:text-5xl lg:text-[3.65rem] lg:leading-[1.05]">
          Tienes información, pero todavía no sabes cómo conectarla.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)]">
          Has estudiado estrategias, indicadores y herramientas. Pero cuando
          llega el momento de tomar una decisión, cada pieza parece funcionar
          por separado. El problema no es aprender más, sino integrar lo que ya
          aprendiste.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/programa"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Comenzar mi formación
          </Link>
          <a
            href="#recorrido"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-border)] px-6 text-sm font-semibold text-white transition hover:border-[var(--color-blue)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Entender el recorrido
          </a>
        </div>
      </div>

      <aside
        aria-label="Síntesis visual del proceso de admisión"
        className="rounded-xl border border-[var(--color-border)] bg-[linear-gradient(180deg,var(--color-panel-bg),var(--color-card-bg))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6 lg:p-7"
      >
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-chart-bg)] p-5">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Mapa académico
          </p>
          <div className="mt-8 grid gap-5">
            {academicMap.map((step, index) => (
              <div
                className="rounded-lg border border-[var(--color-border-soft)] bg-[var(--color-chart-surface)] p-4"
                key={step.title}
              >
                <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-sm font-semibold text-white">
                  {step.title}
                </p>
                <p className="mt-4 text-xs leading-5 text-[var(--color-text-secondary)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-[var(--color-text-secondary)]">
            Cada etapa prepara la siguiente. La mentoría final se construye
            con el recorrido que documentas desde el inicio.
          </p>
        </div>
      </aside>
    </section>
  );
}

function PositioningSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Aquí comienza Invictus GEX
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Una metodología para interpretar el mercado como un único sistema.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)]">
            Invictus GEX aparece después de ese problema: cuando entiendes que
            acumular información no basta. Su valor está en transformar piezas
            dispersas en criterio profesional para interpretar contexto,
            comprender posicionamiento, leer profundidad, analizar flujo,
            construir escenarios y decidir con método.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {principles.map((principle) => (
            <article
              className="border-t border-[var(--color-border)] pt-6"
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

function LearningCostSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Dos formas de avanzar
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            El mercado no cambia porque aprendas una herramienta más.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)]">
            Muchos operadores continúan acumulando información durante años.
            Aprenden nuevos indicadores, nuevas estrategias y nuevas técnicas.
            Sin embargo, el problema permanece: todavía no logran construir una
            interpretación coherente antes de tomar una decisión.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {learningPaths.map((path) => (
            <article
              className="border-t border-[var(--color-border)] pt-6"
              key={path.title}
            >
              <h3 className="text-xl font-semibold text-white">
                {path.title}
              </h3>
              <div className="mt-6 space-y-4">
                {path.steps.map((step) => (
                  <p
                    className="text-sm leading-6 text-[var(--color-text-secondary)]"
                    key={step}
                  >
                    {step}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-lg font-semibold text-white">
          El objetivo no es saber más. El objetivo es comprender mejor.
        </p>
      </div>
    </section>
  );
}

function TransformationSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Cambio de perspectiva
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          Lo que cambiará en tu forma de interpretar el mercado
        </h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {interpretationShifts.map((shift) => (
          <article
            className="border-t border-[var(--color-border)] pt-6"
            key={shift.before}
          >
            <p className="text-sm leading-6 text-[var(--color-text-muted)]">
              Antes
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {shift.before}
            </p>
            <p className="mt-5 text-sm leading-6 text-[var(--color-text-muted)]">
              Ahora
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--color-cyan)]">
              {shift.after}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function IntegrationSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Metodología integrada
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            No aprenderás herramientas por separado.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)]">
            La mayoría de las formaciones enseña herramientas de forma
            independiente. En Invictus GEX aprenderás a integrarlas dentro de
            una metodología diseñada para interpretar el mercado antes de tomar
            una decisión.
          </p>
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section id="recorrido" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Cómo avanza tu decisión
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Del primer contacto a la integración profunda del Método Invictus.
          </h2>
        </div>
        <Link
          href="/programa"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        >
          Comprender el programa
        </Link>
      </div>
      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {academicMap.map((step, index) => (
          <li
            className="min-w-0 border-t border-[var(--color-border)] pt-5"
            key={step.title}
          >
            <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-4 break-words text-sm leading-5 font-semibold text-white">
              {step.title}
            </p>
            <p className="mt-5 text-xs leading-5 text-[var(--color-text-secondary)]">
              {step.description}
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
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Segunda etapa del Método Invictus
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            La mentoría integra lo que el programa desarrolla.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)]">
            La mayoría de operadores aprende herramientas por separado. En
            Invictus GEX aprenderás a relacionarlas dentro de una única
            metodología diseñada para construir contexto antes de ejecutar una
            decisión: Exposición Gamma, Mapa de Liquidez, Order Flow, Big
            Trades, CVD, Delta, Speed of Tape, VWAP y desviaciones cobran valor
            cuando se interpretan como partes de un mismo sistema.
          </p>
        </div>
        <div className="grid gap-3">
          {mentorshipEvidence.map((item) => (
            <p
              className="border-t border-[var(--color-border)] pt-4 text-sm leading-6 text-[var(--color-text-secondary)]"
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
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Capacidades que desarrollarás
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            {course.title}
          </h2>
        </div>
        <Link
          href="/programa"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        >
          Ver detalles de la formación
        </Link>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {course.modules.map((academyModule) => (
          <article
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5"
            key={academyModule.id}
          >
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
              Etapa {academyModule.number}
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
              Explorar capacidad
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
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
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
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8 lg:p-10">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Siguiente paso
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white">
          Si reconoces este proceso como tu siguiente etapa, comienza tu formación.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          El ingreso marca el inicio de una transformación intelectual:
          interpretar el mercado con contexto, profundidad y criterio
          profesional.
        </p>
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
      <p>Invictus GEX © {currentYear}</p>
      <p>Formación profesional en lectura de mercado basada en datos.</p>
    </footer>
  );
}

export function PublicLanding({ course }: PublicLandingProps) {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <Header />
      <main id="inicio">
        <Hero />
        <LearningCostSection />
        <PositioningSection />
        <TransformationSection />
        <IntegrationSection />
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
