"use client";

import Link from "next/link";

import {
  StudentLoadingSkeleton,
  StudentSection,
  StudentStatusBadge,
} from "@/components/student";
import { useProgressContext } from "@/contexts/ProgressContext";
import type { ActiveEnrollmentProduct } from "@/lib/types/enrollment.types";
import type { ProgramModuleProgress } from "@/utils/module-progress";

type StudentDashboardProps = {
  activeProducts: ActiveEnrollmentProduct[];
  session101Unlocked: boolean;
};

type PrimaryAction = {
  href: string;
  label: string;
  note: string;
};

function getStageLabel(moduleProgress: ProgramModuleProgress | null) {
  if (!moduleProgress) {
    return "Recorrido completo";
  }

  return `Etapa ${moduleProgress.academyModule.number}: ${moduleProgress.academyModule.title}`;
}

function getPrimaryAction({
  currentModule,
  programStatus,
  session101Unlocked,
}: {
  currentModule: ProgramModuleProgress | null;
  programStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  session101Unlocked: boolean;
}): PrimaryAction {
  if (session101Unlocked) {
    return {
      href: "/academy/mentoria",
      label: "Reservar mentoría",
      note: "Tu recorrido ya permite avanzar hacia la etapa individual.",
    };
  }

  if (programStatus === "COMPLETED") {
    return {
      href: "/academy/mentoria",
      label: "Ver preparación de mentoría",
      note: "Revisa cómo tu recorrido está preparando la conversación individual.",
    };
  }

  if (currentModule) {
    return {
      href: currentModule.href,
      label: "Continuar formación",
      note: "Retoma la etapa que corresponde dentro de tu recorrido.",
    };
  }

  return {
    href: "/academy/programa",
    label: "Comenzar formación",
    note: "Ingresa al programa y avanza desde la primera etapa disponible.",
  };
}

function FormationStatus({
  completedModules,
  currentModule,
  nextModule,
  totalModules,
}: {
  completedModules: number;
  currentModule: ProgramModuleProgress | null;
  nextModule: ProgramModuleProgress | null;
  totalModules: number;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Etapa actual
        </p>
        <h3 className="mt-4 text-3xl leading-tight font-semibold text-white">
          {getStageLabel(currentModule)}
        </h3>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
          Este es el punto exacto desde el que continúa tu formación. La
          secuencia mantiene el orden para que cada avance tenga contexto.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="border-t border-[var(--color-border)] pt-4">
          <dt className="text-sm text-[var(--color-text-secondary)]">
            Etapas completadas
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-white">
            {completedModules} de {totalModules}
          </dd>
        </div>
        <div className="border-t border-[var(--color-border)] pt-4">
          <dt className="text-sm text-[var(--color-text-secondary)]">
            Siguiente etapa
          </dt>
          <dd className="mt-2 text-lg font-semibold text-white">
            {nextModule
              ? `Etapa ${nextModule.academyModule.number}`
              : "Mentoría individual"}
          </dd>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            {nextModule?.academyModule.title ??
              "La preparación se concentra en tu recorrido documentado."}
          </p>
        </div>
      </dl>
    </div>
  );
}

function MentorshipPreparation({
  session101Unlocked,
}: {
  session101Unlocked: boolean;
}) {
  const requirementsLabel = session101Unlocked
    ? "Requisitos completados"
    : "Requisitos en preparación";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="border-t border-[var(--color-border)] pt-5">
        <h3 className="text-lg font-semibold text-white">
          Reflexiónes documentadas
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          Tus observaciones ayudan a identificar dudas, patrones y puntos de
          revisión para la etapa individual.
        </p>
      </div>
      <div className="border-t border-[var(--color-border)] pt-5">
        <h3 className="text-lg font-semibold text-white">
          Práctica registrada
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          La práctica convierte el estudio en evidencia concreta para revisar
          cómo aplicas la metodología.
        </p>
      </div>
      <div className="border-t border-[var(--color-border)] pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:flex-col md:items-start">
          <h3 className="text-lg font-semibold text-white">
            Requisitos completados
          </h3>
          <StudentStatusBadge tone={session101Unlocked ? "complete" : "warning"}>
            {requirementsLabel}
          </StudentStatusBadge>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          La plataforma consolida tu avance para que la mentoría no empiece en
          blanco.
        </p>
      </div>
    </div>
  );
}

function FormationRecord() {
  const items = [
    {
      label: "Reflexiónes",
      text: "Dudas y observaciones que dan contexto a tu aprendizaje.",
    },
    {
      label: "Ejemplos compartidos",
      text: "Capturas y casos reales que permiten revisar tu lectura.",
    },
    {
      label: "Práctica",
      text: "Días aplicando la metodología antes de la etapa individual.",
    },
    {
      label: "Mentoría",
      text: "Preparación, reserva y cierre personalizado del proceso.",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div className="border-t border-[var(--color-border)] pt-5" key={item.label}>
          <h3 className="text-lg font-semibold text-white">{item.label}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

export function StudentDashboard({
  activeProducts,
  session101Unlocked,
}: StudentDashboardProps) {
  const {
    loading: progressLoading,
    progress,
  } = useProgressContext();
  const primaryProduct = activeProducts[0];
  const primaryAction = getPrimaryAction({
    currentModule: progress.currentModule,
    programStatus: progress.status,
    session101Unlocked,
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(135deg,var(--color-panel-bg),var(--color-card-bg))] p-6 sm:p-8 lg:p-12">
        <p className="text-sm font-semibold tracking-[0.2em] text-[var(--color-cyan)] uppercase">
          Programa de Formación Profesional
        </p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_18rem] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl leading-tight font-semibold text-white sm:text-5xl">
              Centro de Formación
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
              Continua tu recorrido dentro de Invictus GEX con orden, evidencia
              y preparación para la etapa individual.
            </p>
          </div>
          <div className="border-t border-[var(--color-border)] pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Programa activo
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {primaryProduct?.productTitle ?? "Invictus GEX"}
            </p>
          </div>
        </div>
      </section>

      <StudentSection
        description="Una lectura simple de tu posición actual dentro del recorrido."
        title="Estado de Formación"
      >
        {progressLoading ? (
          <StudentLoadingSkeleton columns={2} rows={2} />
        ) : (
          <FormationStatus
            completedModules={progress.completedModules}
            currentModule={progress.currentModule}
            nextModule={progress.nextModule}
            totalModules={progress.totalModules}
          />
        )}
      </StudentSection>

      <StudentSection
        description="Cada evidencia que documentas ayuda a preparar una conversación individual más precisa."
        title="Preparación de Mentoría"
      >
        <MentorshipPreparation session101Unlocked={session101Unlocked} />
      </StudentSection>

      <StudentSection
        description="El expediente ordena las piezas que forman tu recorrido profesional."
        title="Expediente de Formación"
      >
        <FormationRecord />
      </StudentSection>

      <section className="rounded-2xl border border-[var(--color-cyan)] bg-[var(--color-panel-bg)] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              Próxima acción
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {primaryAction.label}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              {primaryAction.note}
            </p>
          </div>
          <Link
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
            href={primaryAction.href}
          >
            {primaryAction.label}
          </Link>
        </div>
      </section>
    </div>
  );
}
