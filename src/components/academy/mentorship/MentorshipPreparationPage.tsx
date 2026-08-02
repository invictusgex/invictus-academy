import Link from "next/link";

import {
  StudentCard,
  StudentContentGrid,
  StudentSection,
  StudentStatCard,
  StudentStatusBadge,
} from "@/components/student";
import { MentorshipSchedulingPanel } from "@/components/academy/mentorship/MentorshipSchedulingPanel";
import type { MentorshipPreparationSummary } from "@/lib/services/mentorship-preparation.service";
import type { MentorshipOutcome } from "@/lib/types/mentorship-outcome.types";
import type {
  MentorshipBooking,
  MentorshipSlot,
} from "@/lib/types/mentorship-scheduling.types";

type MentorshipPreparationPageProps = {
  bookings: MentorshipBooking[];
  outcomes: MentorshipOutcome[];
  preparation: MentorshipPreparationSummary;
  slots: MentorshipSlot[];
};

const journeySteps = [
  "Formación estructurada",
  "Reflexiónes documentadas",
  "Práctica registrada",
  "Requisitos completados",
  "Mentoría individual",
];

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function MentorshipPreparationPage({
  bookings,
  outcomes,
  preparation,
  slots,
}: MentorshipPreparationPageProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Preparación de mentoría
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Tu mentoría se prepara durante todo el programa
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)]">
              Cada reflexión, ejemplo y registro de práctica que documentas nos
              permite conocer mejor tu proceso. Cuando completes los requisitos,
              podrás elegir la fecha de tu mentoría individual.
            </p>
          </div>
          <StudentStatusBadge
            tone={preparation.requirementsSatisfied ? "complete" : "progress"}
          >
            {preparation.status}
          </StudentStatusBadge>
        </div>
      </section>

      <StudentSection title="Recorrido de preparación">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {journeySteps.map((step, index) => (
            <StudentCard className="h-full" key={step}>
              <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-3 text-sm font-semibold leading-5 text-white">
                {step}
              </p>
            </StudentCard>
          ))}
        </div>
      </StudentSection>

      <StudentSection
        description="Resumen real construido con tu progreso, reflexiónes, imágenes y práctica registrada."
        title="Estado actual"
      >
        <StudentContentGrid columns={4}>
          <StudentStatCard
            caption={`${preparation.publishedModules} módulos publicados`}
            label="Módulos completados"
            value={`${preparation.completedModules}/${preparation.publishedModules}`}
          />
          <StudentStatCard
            caption="Módulos con evidencia escrita"
            label="Reflexiónes"
            value={String(preparation.moduleReflectionCount)}
          />
          <StudentStatCard
            caption="Capturas o ejemplos adjuntos"
            label="Imágenes"
            value={String(preparation.totalAttachments)}
          />
          <StudentStatCard
            caption="Registros existentes"
            label="Práctica"
            value={String(preparation.tradingDays)}
          />
        </StudentContentGrid>
      </StudentSection>

      <StudentSection
        description="Cada requisito se evalúa con datos existentes del programa."
        title="Requisitos"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {preparation.rules.map((rule) => (
            <StudentCard className="flex items-start justify-between gap-4" key={rule.key}>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {rule.label}
                </h3>
              </div>
              <StudentStatusBadge tone={rule.satisfied ? "complete" : "warning"}>
                {rule.satisfied ? "Completado" : "Pendiente"}
              </StudentStatusBadge>
            </StudentCard>
          ))}
        </div>
      </StudentSection>

      <StudentSection
        description="Revisa qué información existe por módulo y vuelve al contenido cuando falte algo importante."
        title="Preparación por módulo"
      >
        <div className="space-y-3">
          {preparation.modules.map((academyModule) => {
            const updatedAt = formatUpdatedAt(academyModule.reflectionUpdatedAt);
            const needsInformation =
              !academyModule.hasReflection || academyModule.attachmentCount === 0;

            return (
              <StudentCard
                className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                key={academyModule.moduleKey}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                    Módulo {academyModule.order}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {academyModule.title}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StudentStatusBadge
                      tone={academyModule.completed ? "complete" : "warning"}
                    >
                      {academyModule.completed ? "Completado" : "Pendiente"}
                    </StudentStatusBadge>
                    <StudentStatusBadge
                      tone={academyModule.hasReflection ? "complete" : "neutral"}
                    >
                      {academyModule.hasReflection
                        ? "Con reflexión"
                        : "Sin reflexión"}
                    </StudentStatusBadge>
                    <StudentStatusBadge
                      tone={
                        academyModule.attachmentCount > 0 ? "info" : "neutral"
                      }
                    >
                      {academyModule.attachmentCount} imágenes
                    </StudentStatusBadge>
                  </div>
                  {updatedAt ? (
                    <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                      Última reflexión: {updatedAt}
                    </p>
                  ) : null}
                </div>
                {needsInformation ? (
                  <Link
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-white/[0.03] sm:w-auto"
                    href={`/academy/programa/${academyModule.moduleKey}`}
                  >
                    Volver al módulo
                  </Link>
                ) : null}
              </StudentCard>
            );
          })}
        </div>
      </StudentSection>

      <MentorshipSchedulingPanel
        bookings={bookings}
        outcomes={outcomes}
        requirementsSatisfied={preparation.requirementsSatisfied}
        slots={slots}
      />

      {false ? (
      <StudentSection title="Siguiente etapa">
        <StudentCard elevated>
          {preparation.requirementsSatisfied ? (
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Tu proceso está listo para la siguiente etapa.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                  La agenda se habilitará en una fase posterior. Tu preparación
                  ya queda organizada para continuar.
                </p>
              </div>
              <button
                className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-[var(--color-text-muted)] sm:w-auto"
                disabled
                type="button"
              >
                Agenda disponible próximamente
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Tu mentoría sigue en preparación.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Continúa completando el programa, documentando reflexiónes y
                registrando práctica. Todo ese contexto permitirá preparar mejor
                tu sesión individual.
              </p>
            </div>
          )}
        </StudentCard>
      </StudentSection>
      ) : null}
    </div>
  );
}
