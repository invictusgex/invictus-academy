"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminScenarioDeleteConfirmation } from "@/components/admin/scenarios/AdminScenarioDeleteConfirmation";
import { AdminScenarioStatusActions } from "@/components/admin/scenarios/AdminScenarioStatusActions";
import { ScenarioMedia } from "@/components/scenarios/ScenarioMedia";
import { ScenarioLibraryService } from "@/lib/services/scenario-library.service";
import type { AdminScenario } from "@/lib/types/scenario-library.types";

type AdminScenarioDetailPageProps = {
  scenarioId: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value.includes("T") ? value : `${value}T00:00:00`));
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

export function AdminScenarioDetailPage({
  scenarioId,
}: AdminScenarioDetailPageProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState<AdminScenario | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadScenario() {
      setError("");
      setLoading(true);
      const result = await ScenarioLibraryService.getAdminScenarioById(scenarioId);

      if (!isActive) {
        return;
      }

      if (result.ok) {
        setScenario(result.scenario);
      } else {
        setError(result.message);
        setScenario(null);
      }

      setLoading(false);
    }

    void loadScenario();

    return () => {
      isActive = false;
    };
  }, [scenarioId]);

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
          El escenario solicitado no existe en la biblioteca.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)]"
          href="/admin/scenarios"
        >
          Volver a escenarios
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              className="text-sm font-semibold text-[var(--color-cyan)] transition hover:text-white"
              href="/admin/scenarios"
            >
              Volver a escenarios
            </Link>
            <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
              {scenario.labels.status}
            </p>
            <h1 className="mt-3 break-words text-3xl font-semibold text-white">
              {scenario.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
              {scenario.summary || "Sin resumen disponible."}
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
            href={`/admin/scenarios/${scenario.id}/edit`}
          >
            Editar
          </Link>
        </div>
      </section>

      <AdminScenarioStatusActions
        onUpdated={setScenario}
        scenario={scenario}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="ID" value={scenario.id} />
        <DetailItem label="Key" value={scenario.scenarioKey} />
        <DetailItem label="Estado" value={scenario.labels.status} />
        <DetailItem label="Tipo" value={scenario.labels.scenarioType} />
        <DetailItem label="Mercado" value={scenario.labels.market} />
        <DetailItem
          label="Instrumento"
          value={scenario.instrument || "Sin instrumento"}
        />
        <DetailItem label="Fecha mercado" value={formatDate(scenario.eventDate)} />
        <DetailItem label="Publicado" value={formatDate(scenario.publishedAt)} />
        <DetailItem label="Creado" value={formatDate(scenario.createdAt)} />
        <DetailItem label="Actualizado" value={formatDate(scenario.updatedAt)} />
        <DetailItem
          label="Proveedor video"
          value={scenario.labels.videoProvider ?? "Sin video"}
        />
        <DetailItem label="Video ID" value={scenario.videoId ?? "Sin video ID"} />
        <DetailItem
          label="Video URL"
          value={scenario.videoUrl ?? "Sin URL de video"}
        />
        <DetailItem
          label="Miniatura"
          value={scenario.thumbnailUrl ?? "Sin miniatura"}
        />
        <DetailItem
          label="Documento"
          value={scenario.documentUrl ?? "Sin documento"}
        />
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Descripcion</h2>
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--color-text-secondary)]">
          {scenario.description || "Sin descripcion registrada."}
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-white">Metadata</h2>
        <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm text-[var(--color-text-secondary)]">
          {JSON.stringify(scenario.metadata, null, 2)}
        </pre>
      </section>

      <ScenarioMedia
        documentUrl={scenario.documentUrl}
        thumbnailUrl={scenario.thumbnailUrl}
        title={scenario.title}
        videoEmbedUrl={scenario.videoEmbedUrl}
        videoUrl={scenario.videoUrl}
      />

      <section className="rounded-2xl border border-red-200/40 bg-[var(--color-panel-bg)] p-5">
        <h2 className="text-lg font-semibold text-white">Eliminacion</h2>
        <div className="mt-4">
          <AdminScenarioDeleteConfirmation scenario={scenario} />
        </div>
      </section>
    </div>
  );
}
