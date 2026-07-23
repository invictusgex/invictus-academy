import {
  StudentLoadingSkeleton,
  StudentSection,
} from "@/components/student";

export default function AcademyModuleLoading() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-2xl border border-cyan-200/20 bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-10">
        <div>
          <div className="h-5 w-32 rounded-full bg-white/[0.06]" />
          <div className="mt-5 h-12 max-w-2xl rounded-xl bg-white/[0.06]" />
          <div className="mt-5 h-6 max-w-3xl rounded-xl bg-white/[0.05]" />
          <div className="mt-8 h-12 w-full rounded-full bg-white/[0.06] sm:w-56" />
        </div>
        <div className="aspect-[16/10] rounded-xl border border-[var(--color-border)] bg-white/[0.05] lg:aspect-[4/3]" />
      </section>

      <StudentSection title="Videos">
        <StudentLoadingSkeleton columns={2} rows={2} />
      </StudentSection>

      <StudentSection title="Recursos">
        <StudentLoadingSkeleton columns={2} rows={2} />
      </StudentSection>

      <StudentSection title="Objetivos del modulo">
        <StudentLoadingSkeleton columns={2} rows={2} />
      </StudentSection>

      <StudentSection title="Navegacion">
        <StudentLoadingSkeleton columns={3} rows={3} />
      </StudentSection>
    </div>
  );
}
