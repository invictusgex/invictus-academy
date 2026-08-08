import Link from "next/link";

import { formationCtaHref } from "@/config/public-cta";
import {
  publicFormationJourney,
  publicGlobalCompetencies,
} from "@/content/public-program";

const offerIncludes = [
  {
    title: "Ingreso a Invictus GEX",
    description:
      "Acceso al recorrido profesional de formación en lectura de mercado basada en datos.",
  },
  {
    title: "7 módulos estructurados",
    description:
      "Una progresión desde criterio, mecánicas y regímenes hasta gestión y consolidación.",
  },
  {
    title: "Lectura profesional",
    description:
      "Integración de GEX, liquidez, volumen, estructura, reacción y riesgo.",
  },
  {
    title: "Preparación individual",
    description:
      "El proceso orienta al participante a documentar lecturas, ejemplos y observaciones relevantes.",
  },
  {
    title: "Mentoría privada en vivo 1 a 1",
    description:
      "Una sesión individual con el mentor para integrar y profundizar la metodología con evidencia de tu recorrido.",
  },
];

const traditionalApproach = [
  "Consume información sin una secuencia clara.",
  "Busca indicaciones antes de diagnosticar contexto.",
  "Evalúa decisiones solo por el resultado inmediato.",
  "Trata cada etapa como piezas desconectadas.",
];

const invictusApproach = [
  "Ordena el aprendizaje como proceso profesional.",
  "Diagnostica contexto antes de evaluar participación.",
  "Integra práctica, reflexión y revisión del criterio.",
  "Prepara la integración metodológica desde el primer módulo.",
];

const faqs = [
  {
    question: "¿Qué estoy incorporando al ingresar a Invictus GEX?",
    answer:
      "Ingresas a un programa de formación profesional. No es una compra de videos ni una plataforma aislada; es un proceso diseñado para formar criterio de lectura de mercado.",
  },
  {
    question: "¿La propuesta promete resultados financieros?",
    answer:
      "No. Invictus GEX no promete rentabilidad, ingresos ni resultados asegurados. El objetivo es desarrollar estructura, método, práctica y gestión del riesgo.",
  },
  {
    question: "¿La mentoría es independiente del programa?",
    answer:
      "No. La mentoría privada en vivo 1 a 1 con el mentor es la segunda etapa del Método Invictus. La formación desarrolla fundamentos y la sesión individual integra la metodología con el recorrido documentado del participante.",
  },
  {
    question: "¿Necesito experiencia previa?",
    answer:
      "El recorrido es progresivo, pero exige disposición para estudiar, practicar, revisar decisiones y sostener una preparación seria.",
  },
];

function OfferHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="max-w-[13rem] text-xs font-semibold tracking-[0.12em] text-white uppercase transition hover:text-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:max-w-none sm:text-sm"
      >
        Invictus GEX
      </Link>
      <nav
        aria-label="Navegacion de la propuesta"
        className="hidden items-center gap-6 text-sm text-[var(--color-text-secondary)] md:flex"
      >
        <a className="transition hover:text-white" href="#incluye">
          Incluye
        </a>
        <a className="transition hover:text-white" href="#recorrido">
          Recorrido
        </a>
        <a className="transition hover:text-white" href="#faq">
          FAQ
        </a>
      </nav>
      <Link
        href="/programa"
        className="shrink-0 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
      >
        Ver programa
      </Link>
    </header>
  );
}

function OfferHero() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-14 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Ingreso a Invictus GEX
        </p>
        <h1 className="mt-5 text-4xl leading-tight font-semibold text-white sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
          Una invitación a formarte con estructura, práctica y criterio.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-text-secondary)]">
          El ingreso a Invictus GEX abre un proceso: comprendes el programa,
          comienzas tu formación, practicas, documentas tu avance y llegas a
          una mentoría privada en vivo 1 a 1 preparada con tu recorrido.
        </p>
        <Link
          href={formationCtaHref}
          className="mt-10 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        >
          Comenzar mi formación
        </Link>
      </div>
    </section>
  );
}

function IncludesSection() {
  return (
    <section
      id="incluye"
      className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Que recibes al ingresar
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {offerIncludes.map((item) => (
            <article
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5"
              key={item.title}
            >
              <h2 className="text-lg font-semibold text-white">
                {item.title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                {item.description}
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
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Cómo se desarrolla tu formación
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          El valor esta en avanzar con orden.
        </h2>
      </div>
      <ol className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
        {publicFormationJourney.map((step, index) => (
          <li
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
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
    </section>
  );
}

function MentorshipSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Mentoría privada en vivo · 1 a 1
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            La segunda etapa se construye con información real de tu proceso.
          </h2>
        </div>
        <p className="text-base leading-7 text-[var(--color-text-secondary)]">
          Desde el inicio, el participante documenta lecturas, ejemplos y
          observaciones. Esa preparación permite que la sesión privada en vivo
          con el mentor profundice cómo se relacionan contexto, liquidez, flujo,
          exposición gamma y riesgo dentro de una única metodología.
        </p>
      </div>
    </section>
  );
}

function CompetenciesSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Lo que desarrollaras
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {publicGlobalCompetencies.map((competency) => (
          <p
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]"
            key={competency}
          >
            {competency}
          </p>
        ))}
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section
      id="comparativa"
      className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Diferencia de enfoque
        </p>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6">
            <h2 className="text-2xl font-semibold text-white">
              Consumo educativo tradicional
            </h2>
            <ul className="mt-6 space-y-3">
              {traditionalApproach.map((item) => (
                <li
                  className="text-sm leading-6 text-[var(--color-text-secondary)]"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-[var(--color-cyan)] bg-[var(--color-card-bg)] p-6">
            <h2 className="text-2xl font-semibold text-white">
              Formación Invictus GEX
            </h2>
            <ul className="mt-6 space-y-3">
              {invictusApproach.map((item) => (
                <li
                  className="text-sm leading-6 text-[var(--color-text-secondary)]"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section id="faq" className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Preguntas frecuentes
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <article
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5"
            key={faq.question}
          >
            <h2 className="text-lg font-semibold text-white">
              {faq.question}
            </h2>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              {faq.answer}
            </p>
          </article>
        ))}
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
          Si buscas formación, criterio e integración metodológica, Invictus GEX
          está diseñado para ese recorrido.
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
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p>Invictus GEX</p>
      <p>Formación profesional en lectura de mercado basada en datos.</p>
    </footer>
  );
}

export function PublicOfferPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <OfferHeader />
      <main>
        <OfferHero />
        <IncludesSection />
        <JourneySection />
        <MentorshipSection />
        <CompetenciesSection />
        <ComparisonSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
