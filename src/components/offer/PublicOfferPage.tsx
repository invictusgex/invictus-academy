import Link from "next/link";

import { formationCtaHref } from "@/config/public-cta";
import { publicGlobalCompetencies } from "@/content/public-program";

const offerIncludes = [
  {
    title: "Programa completo",
    description:
      "Acceso al recorrido principal de Trading Basado en Datos con una progresión institucional y estructurada.",
  },
  {
    title: "7 módulos",
    description:
      "Una secuencia pensada para avanzar desde mentalidad y contexto hasta ejecución, gestión y revisión.",
  },
  {
    title: "8 sesiones",
    description:
      "Sesiones organizadas para desarrollar criterio de análisis sin saturar el proceso formativo.",
  },
  {
    title: "Actualizaciones futuras",
    description:
      "Contenido provisionalmente contemplado para mantener la formación alineada con la evolución metodológica.",
  },
  {
    title: "Recursos complementarios",
    description:
      "Materiales de apoyo podrán incorporarse cuando aporten claridad al estudio y a la práctica del proceso.",
  },
];

const learningPath = [
  "Comprender el contexto antes de buscar oportunidades.",
  "Construir mapas operativos con niveles y escenarios.",
  "Validar hipótesis mediante estructura y reacción.",
  "Convertir la lectura en decisiones gestionadas con disciplina.",
];

const traditionalApproach = [
  "Prioriza señales aisladas.",
  "Busca entradas antes de diagnosticar contexto.",
  "Confunde información con confirmación.",
  "Evalúa decisiones solo por el resultado inmediato.",
];

const invictusApproach = [
  "Prioriza proceso y lectura contextual.",
  "Diagnostica el entorno antes de ejecutar.",
  "Integra hipótesis, confirmación e invalidación.",
  "Evalúa la calidad de la decisión y su gestión.",
];

const faqs = [
  {
    question: "¿La oferta incluye señales de trading?",
    answer:
      "No. La academia está orientada a formación, criterio y proceso. No funciona como sala de señales.",
  },
  {
    question: "¿Se garantizan resultados económicos?",
    answer:
      "No. La formación no promete rentabilidad. El objetivo es desarrollar estructura de análisis, gestión del riesgo y disciplina operativa.",
  },
  {
    question: "¿Necesito experiencia previa?",
    answer:
      "La formación está diseñada como un recorrido progresivo. Aun así, exige estudio, práctica y disposición para revisar decisiones.",
  },
  {
    question: "¿El checkout ya está disponible?",
    answer:
      "Todavía no. El acceso comercial definitivo se implementará en una fase posterior.",
  },
];

function OfferHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="max-w-[13rem] text-xs font-semibold tracking-[0.12em] text-white uppercase transition hover:text-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:max-w-none sm:text-sm"
      >
        Invictus Trading Academy
      </Link>
      <nav
        aria-label="Navegación de la oferta"
        className="hidden items-center gap-6 text-sm text-[var(--color-text-secondary)] md:flex"
      >
        <a className="transition hover:text-white" href="#incluye">
          Incluye
        </a>
        <a className="transition hover:text-white" href="#comparativa">
          Comparativa
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
          Oferta formativa
        </p>
        <h1 className="mt-5 text-4xl leading-tight font-semibold text-white sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
          Trading Basado en Datos
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-text-secondary)]">
          Una metodología institucional para estudiar contexto, exposición
          gamma, estructura, confirmación y riesgo antes de convertir una lectura
          en decisión.
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
          Qué incluye
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

function LearningSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <div>
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Cómo aprenderás
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          Un recorrido progresivo para ordenar la toma de decisiones.
        </h2>
      </div>
      <ol className="grid gap-3">
        {learningPath.map((step, index) => (
          <li
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
            key={step}
          >
            <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
              Etapa {String(index + 1).padStart(2, "0")}
            </span>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CompetenciesSection() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Lo que desarrollarás
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
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section id="comparativa" className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Comparativa
      </p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6">
          <h2 className="text-2xl font-semibold text-white">
            Enfoque tradicional
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
            Metodología Invictus
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
    </section>
  );
}

function FaqSection() {
  return (
    <section
      id="faq"
      className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
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
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8 lg:p-10">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          El siguiente paso
        </p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white">
          Comienza una formación centrada en proceso, contexto y disciplina.
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
      <p>Invictus Trading Academy</p>
      <p>Educación financiera con enfoque analítico.</p>
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
        <LearningSection />
        <CompetenciesSection />
        <ComparisonSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
