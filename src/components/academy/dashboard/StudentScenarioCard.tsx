import Image from "next/image";
import Link from "next/link";

import { StudentCard, StudentStatusBadge } from "@/components/student";
import type { PublishedScenario } from "@/lib/types/scenario-library.types";

function formatScenarioDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value.includes("T") ? value : `${value}T00:00:00`));
}

type StudentScenarioCardProps = {
  scenario: PublishedScenario;
};

export function StudentScenarioCard({ scenario }: StudentScenarioCardProps) {
  return (
    <StudentCard>
      {scenario.thumbnailUrl ? (
        <Image
          alt={`Captura de ${scenario.title}`}
          className="h-36 w-full rounded-xl border border-[var(--color-border)] object-cover"
          height={220}
          src={scenario.thumbnailUrl}
          unoptimized
          width={360}
        />
      ) : (
        <div className="flex h-36 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] text-sm text-[var(--color-text-muted)]">
          Sin captura
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        <StudentStatusBadge tone="info">{scenario.labels.scenarioType}</StudentStatusBadge>
        <StudentStatusBadge>{scenario.labels.market}</StudentStatusBadge>
      </div>
      <h3 className="mt-4 line-clamp-2 text-lg font-semibold text-white">
        {scenario.title}
      </h3>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        {formatScenarioDate(scenario.eventDate)}
        {scenario.instrument ? ` - ${scenario.instrument}` : ""}
      </p>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
        {scenario.summary || "Sin resumen disponible."}
      </p>
      <Link
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
        href={`/academy/escenarios/${scenario.scenarioKey}`}
      >
        Ver escenario
      </Link>
    </StudentCard>
  );
}
