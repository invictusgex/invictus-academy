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

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 sm:px-8 lg:px-10">
        <a
          href="#inicio"
          className="text-sm font-semibold tracking-[0.18em] text-white uppercase"
        >
          Invictus Trading Academy
        </a>
        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-8 text-sm text-[var(--color-text-secondary)] sm:flex"
        >
          <a className="transition hover:text-white" href="#inicio">
            Inicio
          </a>
          <a className="transition hover:text-white" href="#programa">
            Programa
          </a>
        </nav>
        <a
          href="#acceso"
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)]"
        >
          Acceder
        </a>
      </header>

      <main id="inicio">
        <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pt-16 pb-20 sm:px-8 sm:pt-24 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:pt-28">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold tracking-[0.2em] text-[var(--color-cyan)] uppercase">
              Formación basada en datos
            </p>
            <h1 className="text-4xl leading-tight font-semibold text-balance text-white sm:text-5xl lg:text-6xl">
              Trading con estructura, evidencia y disciplina
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)]">
              Una plataforma educativa enfocada en Order Flow, Heatmap, Perfil
              de Volumen y Exposición de Gamma para comprender la dinámica real
              del mercado.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#acceso"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
              >
                Acceder a la academia
              </a>
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
            className="self-end border-l border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8"
          >
            <p className="text-sm font-medium text-[var(--color-cyan)]">
              Plataforma educativa en desarrollo.
            </p>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              Base institucional preparada para evolucionar hacia una
              experiencia formativa ordenada, medible y enfocada en lectura de
              mercado.
            </p>
          </aside>
        </section>

        <section
          id="programa"
          className="border-y border-[var(--color-border)] bg-[var(--color-section-bg)]"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-5 px-6 py-16 sm:px-8 lg:grid-cols-3 lg:px-10">
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

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-8 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>Invictus Trading Academy © {currentYear}</p>
        <p>Educación financiera con enfoque analítico.</p>
      </footer>
    </div>
  );
}
