"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { ScenarioLibraryService } from "@/lib/services/scenario-library.service";
import type {
  PublishedScenario,
  ScenarioLibraryFilters,
} from "@/lib/types/scenario-library.types";
import {
  scenarioMarketValues,
  scenarioTypeValues,
} from "@/lib/types/scenario-library.types";

type ScenarioLibraryPageState = {
  error: string;
  filters: ScenarioLibraryFilters;
  loading: boolean;
  scenarios: PublishedScenario[];
};

const initialFilters: ScenarioLibraryFilters = {};

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

function FilterInput({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-white">
      {label}
      <input
        className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
        name={name}
        placeholder={placeholder}
        type="text"
      />
    </label>
  );
}

function ScenarioCard({ scenario }: { scenario: PublishedScenario }) {
  return (
    <article className="grid gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5 lg:grid-cols-[14rem_minmax(0,1fr)]">
      {scenario.thumbnailUrl ? (
        <Image
          alt={`Captura de ${scenario.title}`}
          className="h-44 w-full rounded-xl border border-[var(--color-border)] object-cover lg:h-full"
          height={360}
          src={scenario.thumbnailUrl}
          unoptimized
          width={480}
        />
      ) : (
        <div className="flex h-44 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] text-sm text-[var(--color-text-muted)] lg:h-full">
          Sin captura
        </div>
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2 text-xs font-semibold tracking-[0.12em] uppercase">
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-cyan)]">
            {scenario.labels.scenarioType}
          </span>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--color-text-secondary)]">
            {scenario.labels.market}
          </span>
        </div>
        <h2 className="mt-4 break-words text-xl font-semibold text-white">
          {scenario.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {formatDate(scenario.eventDate)} -{" "}
          {scenario.instrument || "Sin instrumento"}
        </p>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          {scenario.summary || "Sin resumen disponible."}
        </p>
        <Link
          className="mt-5 inline-flex min-h-10 items-center rounded-full bg-[var(--color-cyan)] px-4 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href={`/academy/escenarios/${scenario.scenarioKey}`}
        >
          Ver escenario
        </Link>
      </div>
    </article>
  );
}

export function ScenarioLibraryPage() {
  const [state, setState] = useState<ScenarioLibraryPageState>({
    error: "",
    filters: initialFilters,
    loading: true,
    scenarios: [],
  });

  useEffect(() => {
    let isActive = true;

    async function loadScenarios() {
      setState((current) => ({ ...current, error: "", loading: true }));
      const result = await ScenarioLibraryService.getPublishedScenarios(
        state.filters,
      );

      if (!isActive) {
        return;
      }

      if (result.ok) {
        setState((current) => ({
          ...current,
          error: "",
          loading: false,
          scenarios: result.scenarios,
        }));
      } else {
        setState((current) => ({
          ...current,
          error: result.message,
          loading: false,
          scenarios: [],
        }));
      }
    }

    void loadScenarios();

    return () => {
      isActive = false;
    };
  }, [state.filters]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const scenarioType = String(formData.get("scenarioType") ?? "");
    const market = String(formData.get("market") ?? "");
    const instrument = String(formData.get("instrument") ?? "");
    const year = String(formData.get("year") ?? "");
    const query = String(formData.get("query") ?? "");

    setState((current) => ({
      ...current,
      filters: {
        ...initialFilters,
        instrument: instrument.trim().toUpperCase() || undefined,
        market:
          scenarioMarketValues.find((value) => value === market) ?? undefined,
        query: query.trim() || undefined,
        scenarioType:
          scenarioTypeValues.find((value) => value === scenarioType) ??
          undefined,
        year: Number.parseInt(year, 10) || undefined,
      },
    }));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Biblioteca de Escenarios
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          Lecturas operativas del mercado
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
          Analisis, ejemplos y estructuras de mercado publicados para alumnos
          con acceso activo al programa.
        </p>
      </section>

      <form
        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5"
        onSubmit={applyFilters}
      >
        <div className="grid gap-4 lg:grid-cols-5">
          <FilterInput label="Buscar titulo" name="query" />
          <FilterInput label="Instrumento" name="instrument" placeholder="NQ" />
          <FilterInput label="Anio" name="year" placeholder="2026" />
          <label className="grid gap-2 text-sm font-medium text-white">
            Tipo
            <select
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              name="scenarioType"
            >
              <option value="">Todos</option>
              {scenarioTypeValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-white">
            Mercado
            <select
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              name="market"
            >
              <option value="">Todos</option>
              {scenarioMarketValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
          type="submit"
        >
          Filtrar
        </button>
      </form>

      {state.loading ? (
        <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 text-sm text-[var(--color-text-secondary)]">
          Cargando escenarios...
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-2xl border border-red-200/40 bg-[var(--color-panel-bg)] p-5 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      {!state.loading && !state.error && state.scenarios.length === 0 ? (
        <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 text-sm text-[var(--color-text-secondary)]">
          Aun no hay escenarios publicados para mostrar.
        </p>
      ) : null}

      <section className="grid gap-4">
        {state.scenarios.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </section>
    </div>
  );
}
