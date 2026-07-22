"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ScenarioLibraryService } from "@/lib/services/scenario-library.service";
import type {
  AdminScenario,
  AdminScenarioSummary,
} from "@/lib/types/scenario-library.types";

type SummaryItem = {
  label: string;
  value: number;
};

const emptySummary: AdminScenarioSummary = {
  archived: 0,
  drafts: 0,
  published: 0,
  total: 0,
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value.includes("T") ? value : `${value}T00:00:00`));
}

function SummaryCard({ label, value }: SummaryItem) {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4">
      <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </article>
  );
}

export function AdminScenariosPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<AdminScenario[]>([]);
  const [summary, setSummary] = useState<AdminScenarioSummary>(emptySummary);

  useEffect(() => {
    let isActive = true;

    async function loadScenarios() {
      setError("");
      setLoading(true);
      const result = await ScenarioLibraryService.getAdminScenarios();

      if (!isActive) {
        return;
      }

      if (result.ok) {
        setScenarios(result.scenarios);
        setSummary(result.summary);
      } else {
        setError(result.message);
        setScenarios([]);
        setSummary(result.summary);
      }

      setLoading(false);
    }

    void loadScenarios();

    return () => {
      isActive = false;
    };
  }, []);

  const summaryItems = useMemo<SummaryItem[]>(
    () => [
      { label: "Total", value: summary.total },
      { label: "Publicados", value: summary.published },
      { label: "Borradores", value: summary.drafts },
      { label: "Archivados", value: summary.archived },
    ],
    [summary],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Biblioteca de Escenarios
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Escenarios de mercado
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Lectura administrativa de analisis y ejemplos operativos publicados o
          preparados para alumnos.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
        <div className="flex flex-col gap-2 border-b border-[var(--color-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-white">Listado</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {loading ? "Cargando escenarios..." : `${scenarios.length} escenarios`}
          </p>
        </div>

        {error ? (
          <div className="p-5 text-sm text-red-200">{error}</div>
        ) : null}

        {!error ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[72rem] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-card-bg)] text-xs tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
                <tr>
                  <th className="px-5 py-4 font-semibold">Titulo</th>
                  <th className="px-5 py-4 font-semibold">Tipo</th>
                  <th className="px-5 py-4 font-semibold">Mercado</th>
                  <th className="px-5 py-4 font-semibold">Instrumento</th>
                  <th className="px-5 py-4 font-semibold">Estado</th>
                  <th className="px-5 py-4 font-semibold">Fecha mercado</th>
                  <th className="px-5 py-4 font-semibold">Actualizado</th>
                  <th className="px-5 py-4 font-semibold">Accion</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => (
                  <tr
                    className="border-t border-[var(--color-border)]"
                    key={scenario.id}
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      {scenario.title}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {scenario.labels.scenarioType}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {scenario.labels.market}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {scenario.instrument || "Sin instrumento"}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-cyan)]">
                      {scenario.labels.status}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {formatDate(scenario.eventDate)}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-text-secondary)]">
                      {formatDate(scenario.updatedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        className="font-semibold text-[var(--color-cyan)] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
                        href={`/admin/scenarios/${scenario.id}`}
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {!loading && scenarios.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-8 text-center text-[var(--color-text-secondary)]"
                      colSpan={8}
                    >
                      No hay escenarios registrados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
