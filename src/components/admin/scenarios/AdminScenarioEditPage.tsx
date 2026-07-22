"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminScenarioForm } from "@/components/admin/scenarios/AdminScenarioForm";
import { ScenarioLibraryService } from "@/lib/services/scenario-library.service";
import type { AdminScenario } from "@/lib/types/scenario-library.types";

type AdminScenarioEditPageProps = {
  scenarioId: string;
};

export function AdminScenarioEditPage({
  scenarioId,
}: AdminScenarioEditPageProps) {
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

  if (error || !scenario) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Biblioteca de Escenarios
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Escenario no disponible
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
          {error || "No fue posible cargar el escenario solicitado."}
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
        <Link
          className="text-sm font-semibold text-[var(--color-cyan)] transition hover:text-white"
          href={`/admin/scenarios/${scenario.id}`}
        >
          Volver al escenario
        </Link>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          {scenario.scenarioKey}
        </p>
        <h1 className="mt-3 break-words text-3xl font-semibold text-white">
          Editar escenario
        </h1>
      </section>

      <AdminScenarioForm mode="edit" scenario={scenario} />
    </div>
  );
}
