import Link from "next/link";

const focusCards = [
  {
    title: "Datos, no opiniones",
    description:
      "Análisis orientado por evidencia observable para reducir decisiones impulsivas y mejorar la lectura del contexto.",
  },
  {
    title: "Lectura de liquidez",
    description:
      "Enfoque en zonas de participación, absorción y desequilibrios para interpretar la intención del mercado.",
  },
  {
    title: "Gestión del riesgo",
    description:
      "Disciplina operativa, escenarios definidos y control de exposición antes de cualquier decisión de entrada.",
  },
];

const liquidityLevels = [
  { label: "Base", width: "76%", tone: "muted" },
  { label: "Zona", width: "92%", tone: "cyan" },
  { label: "Equilibrio", width: "58%", tone: "blue" },
  { label: "Interes", width: "84%", tone: "muted" },
];

const marketPoints = [
  "left-[14%] top-[62%]",
  "left-[31%] top-[44%]",
  "left-[48%] top-[53%]",
  "left-[67%] top-[32%]",
  "left-[82%] top-[46%]",
];

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
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
          <a className="transition hover:text-white" href="#inicio">
            Inicio
          </a>
          <a className="transition hover:text-white" href="#programa">
            Programa
          </a>
        </nav>
        <Link
          href="/academy"
          className="shrink-0 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)]"
        >
          Acceder
        </Link>
      </header>

      <main id="inicio">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-8 lg:pt-16 lg:pb-18">
          <div className="max-w-[43rem]">
            <p className="mb-5 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-[var(--color-cyan)] uppercase">
              Formación basada en datos
            </p>
            <h1 className="max-w-[42rem] text-4xl leading-tight font-semibold text-balance text-white sm:text-5xl lg:text-[3.65rem] lg:leading-[1.05]">
              Trading con estructura, evidencia y disciplina
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)]">
              Una plataforma educativa enfocada en Order Flow, Heatmap, Perfil
              de Volumen y Exposición de Gamma para comprender la dinámica real
              del mercado.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/academy"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
              >
                Acceder a la academia
              </Link>
              <a
                href="#programa"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--color-border)] px-6 text-sm font-semibold text-white transition hover:border-[var(--color-blue)] hover:bg-[var(--color-hover-bg)]"
              >
                Conocer el programa
              </a>
            </div>
          </div>

          <aside
            aria-label="Estado de la plataforma"
            className="rounded-xl border border-[var(--color-border)] bg-[linear-gradient(180deg,var(--color-panel-bg),var(--color-card-bg))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6 lg:p-7"
          >
            <div className="market-panel relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-chart-bg)] p-5">
              <div className="relative z-10">
                <p className="text-sm font-medium text-[var(--color-cyan)]">
                  Plataforma educativa en desarrollo.
                </p>
                <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">
                  Un entorno preparado para estudiar lectura de liquidez,
                  estructura de mercado y gestion disciplinada del riesgo.
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

        <section
          id="programa"
          className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-12 sm:px-6 sm:py-14 lg:grid-cols-3 lg:px-8">
            {focusCards.map((card) => (
              <article
                key={card.title}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6"
              >
                <h2 className="text-xl font-semibold text-white">
                  {card.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Invictus Trading Academy © {currentYear}</p>
        <p>Educación financiera con enfoque analítico.</p>
      </footer>
    </div>
  );
}
