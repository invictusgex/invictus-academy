"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ScenarioMedia } from "@/components/scenarios/ScenarioMedia";
import { ScenarioLibraryService } from "@/lib/services/scenario-library.service";
import type { PublishedScenario } from "@/lib/types/scenario-library.types";

type ScenarioDetailPageProps = {
  scenarioKey: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4">
      <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-white">
        {value}
      </p>
    </article>
  );
}

export function ScenarioDetailPage({ scenarioKey }: ScenarioDetailPageProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState<PublishedScenario | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadScenario() {
      setError("");
      setLoading(true);
      const result =
        await ScenarioLibraryService.getPublishedScenarioByIdOrKey(scenarioKey);

      if (!isActive) {
        return;
      }

      if (result.ok) {
        setScenario(result.scenario);
        setLoading(false);
      } else {
        setError(result.message);
        setScenario(null);
        setLoading(false);
      }
    }

    void loadScenario();

    return () => {
      isActive = false;
    };
  }, [scenarioKey]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Cargando escenario...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200/40 bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <h1 className="text-3xl font-semibold text-white">No disponible</h1>
        <p className="mt-4 text-sm text-red-200">{error}</p>
      </section>
    );
  }

  if (!scenario) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Biblioteca de Escenarios
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Escenario no encontrado
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
          El escenario solicitado no existe o no esta publicado.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)]"
          href="/academy/escenarios"
        >
          Volver a escenarios
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <Link
          className="text-sm font-semibold text-[var(--color-cyan)] transition hover:text-white"
          href="/academy/escenarios"
        >
          Volver a escenarios
        </Link>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          {scenario.labels.scenarioType}
        </p>
        <h1 className="mt-3 break-words text-3xl font-semibold text-white">
          {scenario.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          {scenario.summary || "Sin resumen disponible."}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Fecha" value={formatDate(scenario.eventDate)} />
        <DetailItem label="Mercado" value={scenario.labels.market} />
        <DetailItem
          label="Instrumento"
          value={scenario.instrument || "Sin instrumento"}
        />
        <DetailItem label="Tipo" value={scenario.labels.scenarioType} />
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Descripcion</h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--color-text-secondary)]">
          {scenario.description || "Sin descripcion registrada."}
        </p>
      </section>

      <ScenarioMedia
        documentUrl={scenario.documentUrl}
        thumbnailUrl={scenario.thumbnailUrl}
        title={scenario.title}
        videoEmbedUrl={scenario.videoEmbedUrl}
        videoUrl={scenario.videoUrl}
      />
    </div>
  );
}
