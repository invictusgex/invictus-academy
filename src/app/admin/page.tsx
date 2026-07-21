const adminCards = [
  {
    title: "Alumnos",
    description: "Consulta y seguimiento administrativo de alumnos.",
  },
  {
    title: "Enrollments",
    description: "Preparado para revisar accesos al programa.",
  },
  {
    title: "Productos",
    description: "Base futura para administrar productos formativos.",
  },
  {
    title: "Progreso",
    description: "Vista futura para supervisar avance academico.",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Resumen administrativo
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Panel administrativo
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Gestión de alumnos, accesos y productos de Invictus Trading Academy.
        </p>
      </section>

      <section
        aria-label="Áreas administrativas provisionales"
        className="grid gap-4 md:grid-cols-2"
      >
        {adminCards.map((card) => (
          <article
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 sm:p-6"
            key={card.title}
          >
            <h2 className="text-xl font-semibold text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {card.description}
            </p>
            <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-[var(--color-text-muted)] uppercase">
              Próximamente
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
