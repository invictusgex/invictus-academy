"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminScenarioSaveStatus } from "@/components/admin/scenarios/AdminScenarioSaveStatus";
import { AdminScenarioValidationErrors } from "@/components/admin/scenarios/AdminScenarioValidationErrors";
import { ScenarioLibraryService } from "@/lib/services/scenario-library.service";
import type {
  AdminScenario,
  AdminScenarioEditableData,
  AdminScenarioValidationError,
} from "@/lib/types/scenario-library.types";
import {
  scenarioMarketValues,
  scenarioStatusValues,
  scenarioTypeValues,
  scenarioVideoProviderValues,
} from "@/lib/types/scenario-library.types";

type AdminScenarioFormProps = {
  mode: "create" | "edit";
  scenario?: AdminScenario;
};

function createInitialFormData(
  scenario?: AdminScenario,
): AdminScenarioEditableData {
  return {
    description: scenario?.description ?? "",
    documentUrl: scenario?.documentUrl ?? "",
    eventDate: scenario?.eventDate ?? "",
    instrument: scenario?.instrument ?? "",
    market: scenario?.market ?? "futures",
    scenarioType: scenario?.scenarioType ?? "market_analysis",
    status: scenario?.status ?? "draft",
    summary: scenario?.summary ?? "",
    thumbnailUrl: scenario?.thumbnailUrl ?? "",
    title: scenario?.title ?? "",
    videoId: scenario?.videoId ?? "",
    videoProvider: scenario?.videoProvider ?? "",
    videoUrl: scenario?.videoUrl ?? "",
  };
}

export function AdminScenarioForm({ mode, scenario }: AdminScenarioFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<AdminScenarioValidationError[]>([]);
  const [formData, setFormData] = useState(() =>
    createInitialFormData(scenario),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] =
    useState<"error" | "idle" | "saved" | "saving">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setErrors([]);
    setIsSaving(true);
    setSaveStatus("saving");

    const result =
      mode === "create"
        ? await ScenarioLibraryService.createScenario(formData)
        : await ScenarioLibraryService.updateScenario(scenario?.id ?? "", formData);

    if (result.ok) {
      setSaveStatus("saved");
      router.push(`/admin/scenarios/${result.scenario.id}`);
    } else {
      setErrors(result.errors);
      setSaveStatus("error");
    }

    setIsSaving(false);
  }

  return (
    <form
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Biblioteca de Escenarios
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {mode === "create" ? "Nuevo escenario" : "Editar escenario"}
          </h2>
        </div>
        <AdminScenarioSaveStatus status={saveStatus} />
      </div>

      <AdminScenarioValidationErrors errors={errors} field="general" />

      <div className="mt-6 grid gap-5">
        <label className="grid gap-2 text-sm font-medium text-white">
          Titulo
          <input
            className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={160}
            onChange={(event) =>
              setFormData((current) => ({ ...current, title: event.target.value }))
            }
            required
            type="text"
            value={formData.title}
          />
          <AdminScenarioValidationErrors errors={errors} field="title" />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white">
          Resumen
          <textarea
            className="min-h-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={300}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                summary: event.target.value,
              }))
            }
            required
            value={formData.summary}
          />
          <AdminScenarioValidationErrors errors={errors} field="summary" />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white">
          Descripcion
          <textarea
            className="min-h-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={5000}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            value={formData.description}
          />
          <AdminScenarioValidationErrors errors={errors} field="description" />
        </label>

        <div className="grid gap-5 lg:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-white">
            Tipo
            <select
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  scenarioType:
                    event.target.value as AdminScenarioEditableData["scenarioType"],
                }))
              }
              value={formData.scenarioType}
            >
              {scenarioTypeValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <AdminScenarioValidationErrors errors={errors} field="scenarioType" />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white">
            Mercado
            <select
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  market: event.target.value as AdminScenarioEditableData["market"],
                }))
              }
              value={formData.market}
            >
              {scenarioMarketValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <AdminScenarioValidationErrors errors={errors} field="market" />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white">
            Estado
            <select
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  status: event.target.value as AdminScenarioEditableData["status"],
                }))
              }
              value={formData.status}
            >
              {scenarioStatusValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <AdminScenarioValidationErrors errors={errors} field="status" />
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-white">
            Instrumento
            <input
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              maxLength={32}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  instrument: event.target.value,
                }))
              }
              placeholder="NQ, MNQ, ES, MES, SPX, SPY"
              type="text"
              value={formData.instrument}
            />
            <AdminScenarioValidationErrors errors={errors} field="instrument" />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white">
            Fecha del escenario
            <input
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  eventDate: event.target.value,
                }))
              }
              type="date"
              value={formData.eventDate}
            />
            <AdminScenarioValidationErrors errors={errors} field="eventDate" />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-white">
          Miniatura
          <input
            className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={500}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                thumbnailUrl: event.target.value,
              }))
            }
            type="url"
            value={formData.thumbnailUrl}
          />
          <AdminScenarioValidationErrors errors={errors} field="thumbnailUrl" />
        </label>

        <div className="grid gap-5 lg:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-white">
            Proveedor de video
            <select
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  videoProvider:
                    event.target.value as AdminScenarioEditableData["videoProvider"],
                }))
              }
              value={formData.videoProvider}
            >
              <option value="">Sin video</option>
              {scenarioVideoProviderValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <AdminScenarioValidationErrors errors={errors} field="videoProvider" />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white">
            ID del video
            <input
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              maxLength={300}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  videoId: event.target.value,
                }))
              }
              type="text"
              value={formData.videoId}
            />
            <AdminScenarioValidationErrors errors={errors} field="videoId" />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white">
            URL del video
            <input
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              maxLength={500}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  videoUrl: event.target.value,
                }))
              }
              type="url"
              value={formData.videoUrl}
            />
            <AdminScenarioValidationErrors errors={errors} field="videoUrl" />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-white">
          Documento
          <input
            className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={500}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                documentUrl: event.target.value,
              }))
            }
            type="url"
            value={formData.documentUrl}
          />
          <AdminScenarioValidationErrors errors={errors} field="documentUrl" />
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)]"
          href={scenario ? `/admin/scenarios/${scenario.id}` : "/admin/scenarios"}
        >
          Cancelar
        </Link>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
