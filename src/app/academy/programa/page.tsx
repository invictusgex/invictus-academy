import { AcademyShell } from "@/components/layout/academy-shell";
import { FormationTrajectory } from "@/components/academy/FormationTrajectory";
import { ModuleProgramCard } from "@/components/academy/ModuleProgramCard";
import { ProgramHeader } from "@/components/academy/ProgramHeader";
import { ProgramSummary } from "@/components/academy/ProgramSummary";
import { getAcademyProgram } from "@/lib/academy";

export default function AcademyProgramPage() {
  const course = getAcademyProgram();

  return (
    <AcademyShell>
      <ProgramHeader course={course} />

      <div className="mt-6">
        <ProgramSummary course={course} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start">
        <FormationTrajectory course={course} />

        <section>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Módulos estructurados
          </p>
          <div className="mt-5 grid gap-4">
            {course.modules.map((module) => (
              <ModuleProgramCard
                key={module.number}
                module={module}
                programId={course.id}
              />
            ))}
          </div>
        </section>
      </div>
    </AcademyShell>
  );
}
