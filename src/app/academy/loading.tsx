import {
  StudentLoadingSkeleton,
  StudentSection,
} from "@/components/student";

export default function AcademyLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8 lg:p-10">
        <div className="h-7 w-32 rounded-full bg-[var(--color-card-bg)]" />
        <div className="mt-6 h-12 max-w-2xl rounded-xl bg-[var(--color-card-bg)]" />
        <div className="mt-5 h-6 max-w-3xl rounded-xl bg-[var(--color-card-bg)]" />
        <div className="mt-8 h-12 w-full rounded-full bg-[var(--color-card-bg)] sm:w-56" />
      </section>

      <StudentSection title="Resumen del programa">
        <StudentLoadingSkeleton columns={3} rows={3} />
      </StudentSection>

      <StudentSection title="Continuar formacion">
        <StudentLoadingSkeleton columns={2} rows={1} />
      </StudentSection>

      <StudentSection title="Programa">
        <StudentLoadingSkeleton columns={4} rows={4} />
      </StudentSection>

      <StudentSection title="Escenarios recientes">
        <StudentLoadingSkeleton columns={3} rows={3} />
      </StudentSection>
    </div>
  );
}
