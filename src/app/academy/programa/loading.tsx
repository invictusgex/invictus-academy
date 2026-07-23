import {
  StudentLoadingSkeleton,
  StudentSection,
} from "@/components/student";

export default function AcademyProgramLoading() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="h-5 w-44 rounded-full bg-white/[0.06]" />
          <div className="mt-4 h-10 max-w-sm rounded-xl bg-white/[0.06]" />
          <div className="mt-4 h-6 max-w-3xl rounded-xl bg-white/[0.05]" />
        </div>
        <div className="h-10 w-full rounded-full bg-white/[0.06] sm:w-44" />
      </header>

      <StudentSection title="Resumen del progreso">
        <StudentLoadingSkeleton columns={3} rows={3} />
      </StudentSection>

      <StudentSection title="Modulo actual">
        <StudentLoadingSkeleton columns={2} rows={1} />
      </StudentSection>

      <StudentSection title="Listado completo de modulos">
        <StudentLoadingSkeleton columns={2} rows={4} />
      </StudentSection>
    </div>
  );
}
