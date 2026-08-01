import Link from "next/link";

import { formationCtaHref } from "@/config/public-cta";
import {
  publicFormationJourney,
  publicGlobalCompetencies,
} from "@/content/public-program";

const offerIncludes = [
  {
    title: "Programa profesional Invictus GEX",
    description:
      "Acceso al recorrido principal de formacion en lectura de mercado basada en datos.",
  },
  {
    title: "7 modulos estructurados",
    description:
      "Una progresion academica desde criterio, mecanicas y regimenes hasta gestion y consolidacion.",
  },
  {
    title: "Herramientas de lectura",
    description:
      "Integracion metodologica de GEX, liquidez, volumen, estructura, reaccion y riesgo.",
  },
  {
    title: "Preparacion individual",
    description:
      "El proceso orienta al participante a documentar dudas, ejemplos y observaciones relevantes.",
  },
  {
    title: "Mentoria personalizada",
    description:
      "La etapa individual se prepara con evidencia del recorrido para revisar criterio, dudas y aplicacion.",
  },
];

const traditionalApproach = [
  "Consume informacion sin una secuencia clara.",
  "Busca indicaciones antes de diagnosticar contexto.",
  "Evalua decisiones solo por el resultado inmediato.",
  "Trata la mentoria como un complemento separado.",
];

const invictusApproach = [
  "Ordena el aprendizaje como proceso profesional.",
  "Diagnostica contexto antes de evaluar participacion.",
  "Integra practica, reflexion y revision del criterio.",
  "Prepara la mentoria desde el primer modulo.",
];

const faqs = [
  {
    question: "Que estoy incorporando al ingresar a Invictus GEX?",
    answer:
      "Ingresas a un programa de formacion profesional. No es una compra de videos ni una plataforma aislada; es un proceso diseñado para formar criterio de lectura de mercado.",
  },
  {
    question: "La propuesta promete resultados financieros?",
    answer:
      "No. Invictus GEX no promete rentabilidad, ingresos ni resultados asegurados. El objetivo es desarrollar estructura, metodo, practica y gestion del riesgo.",
  },
  {
    question: "La mentoria es independiente del programa?",
    answer:
      "No. La mentoria es la culminacion del recorrido. La formacion previa prepara la conversacion individual con dudas, ejemplos y observaciones del participante.",
  },
  {
    question: "Necesito experiencia previa?",
    answer:
      "El recorrido es progresivo, pero exige disposicion para estudiar, practicar, revisar decisiones y sostener una preparacion seria.",
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
          Un programa profesional para formar criterio de mercado.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-text-secondary)]">
          La propuesta integra formacion estructurada, aplicacion practica,
          reflexion sobre el aprendizaje, preparacion personalizada y mentoria
          individual. El objetivo es que el participante avance con metodo, no
          con presion comercial.
        </p>
        <Link
          href={formationCtaHref}
          className="mt-10 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
        >
          Iniciar mi formacion
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
          Que incluye el ingreso
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
          Como se desarrolla tu formacion
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          El valor esta en el recorrido completo.
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
            Preparacion personalizada
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            La mentoria se construye con informacion real de tu avance.
          </h2>
        </div>
        <p className="text-base leading-7 text-[var(--color-text-secondary)]">
          Desde el inicio, el participante va ordenando dudas, ejemplos,
          reflexiones y observaciones de practica. Esa preparacion permite que
          la mentoria individual se enfoque en su criterio, sus dificultades y
          su manera de aplicar la metodologia.
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
              Formacion Invictus GEX
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
          Si buscas formacion, criterio y preparacion individual, Invictus GEX
          esta diseñado para ese recorrido.
        </h2>
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
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <p>Invictus GEX</p>
      <p>Formacion profesional en lectura de mercado basada en datos.</p>
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
