import { AcademyHeader } from "@/components/layout/academy-header";
import { AcademySidebar } from "@/components/layout/academy-sidebar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ModuleCard } from "@/features/academy/module-card";
import { academyModules, academyNavigation } from "@/lib/academy-content";

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)] lg:flex">
      <AcademySidebar navigation={academyNavigation} />

      <div className="min-w-0 flex-1">
        <AcademyHeader />

        <main className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-6 sm:py-8 lg:px-8">
          <section className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(180deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Academia
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
              Bienvenido a Invictus
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
              Tu espacio de formación para estudiar el mercado con estructura,
              evidencia y disciplina.
            </p>
          </section>

          <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
                  Tu progreso
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Progreso general
                </h2>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                Aún no has comenzado ninguna lección.
              </p>
            </div>
            <div className="mt-6">
              <ProgressBar label="Progreso general" value={0} />
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
                  Programa
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Mi programa
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {academyModules.map((module) => (
                <ModuleCard key={module.moduleNumber} module={module} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
