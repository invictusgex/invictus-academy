"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { AdminContentSaveStatus } from "@/components/admin/content/AdminContentSaveStatus";
import { AdminContentValidationErrors } from "@/components/admin/content/AdminContentValidationErrors";
import { LearningObjectivesEditor } from "@/components/admin/content/LearningObjectivesEditor";
import {
  AdminContentService,
  validateAdminContentModuleInput,
} from "@/lib/services/admin-content.service";
import type {
  AdminContentEditableModuleData,
  AdminContentModule,
  AdminContentModuleValidationError,
} from "@/lib/types/admin-content.types";
import {
  adminContentAvailabilityValues,
  adminContentStatusValues,
} from "@/lib/types/admin-content.types";

type AdminContentModuleGeneralInfoFormProps = {
  module: AdminContentModule;
  onSaved: (module: AdminContentModule) => void;
};

function createInitialFormData(
  academyModule: AdminContentModule,
): AdminContentEditableModuleData {
  return {
    availability: academyModule.availability,
    description: academyModule.description,
    estimatedDurationMinutes: academyModule.estimatedDurationMinutes,
    learningObjectives: academyModule.learningObjectives,
    overview: academyModule.overview,
    status: academyModule.status,
    title: academyModule.title,
  };
}

export function AdminContentModuleGeneralInfoForm({
  module,
  onSaved,
}: AdminContentModuleGeneralInfoFormProps) {
  const [formData, setFormData] = useState(() => createInitialFormData(module));
  const [errors, setErrors] = useState<AdminContentModuleValidationError[]>([]);
  const [saveStatus, setSaveStatus] =
    useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isSaving, setIsSaving] = useState(false);
  const durationValue = useMemo(
    () =>
      formData.estimatedDurationMinutes === null
        ? ""
        : String(formData.estimatedDurationMinutes),
    [formData.estimatedDurationMinutes],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const validation = validateAdminContentModuleInput(formData);

    if (validation.errors.length > 0) {
      setErrors(validation.errors);
      setSaveStatus("error");
      return;
    }

    setErrors([]);
    setIsSaving(true);
    setSaveStatus("saving");

    const result = await AdminContentService.updateModuleGeneralInfo(
      module.id,
      validation.normalized,
    );

    if (result.ok) {
      setFormData(createInitialFormData(result.module));
      setErrors([]);
      setSaveStatus("saved");
      onSaved(result.module);
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
            Informacion general
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Editar modulo
          </h2>
        </div>
        <AdminContentSaveStatus status={saveStatus} />
      </div>

      <AdminContentValidationErrors errors={errors} field="general" />

      <div className="mt-6 grid gap-5">
        <label className="grid gap-2 text-sm font-medium text-white">
          Titulo
          <input
            className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={160}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            required
            type="text"
            value={formData.title}
          />
          <AdminContentValidationErrors errors={errors} field="title" />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white">
          Descripcion
          <input
            className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={500}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            type="text"
            value={formData.description}
          />
          <AdminContentValidationErrors errors={errors} field="description" />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white">
          Resumen general
          <textarea
            className="min-h-36 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={2000}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                overview: event.target.value,
              }))
            }
            value={formData.overview}
          />
          <AdminContentValidationErrors errors={errors} field="overview" />
        </label>

        <div>
          <p className="text-sm font-medium text-white">Objetivos</p>
          <div className="mt-3">
            <LearningObjectivesEditor
              disabled={isSaving}
              objectives={formData.learningObjectives}
              onChange={(learningObjectives) =>
                setFormData((current) => ({
                  ...current,
                  learningObjectives,
                }))
              }
            />
          </div>
          <AdminContentValidationErrors
            errors={errors}
            field="learningObjectives"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-white">
            Duracion estimada
            <input
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              min={0}
              onChange={(event) => {
                const value = event.target.value;

                setFormData((current) => ({
                  ...current,
                  estimatedDurationMinutes:
                    value === "" ? null : Number.parseInt(value, 10),
                }));
              }}
              step={1}
              type="number"
              value={durationValue}
            />
            <AdminContentValidationErrors
              errors={errors}
              field="estimatedDurationMinutes"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white">
            Disponibilidad
            <select
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  availability: event.target
                    .value as AdminContentEditableModuleData["availability"],
                }))
              }
              value={formData.availability}
            >
              {adminContentAvailabilityValues.map((availability) => (
                <option key={availability} value={availability}>
                  {availability}
                </option>
              ))}
            </select>
            <AdminContentValidationErrors errors={errors} field="availability" />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white">
            Estado
            <select
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  status: event.target
                    .value as AdminContentEditableModuleData["status"],
                }))
              }
              value={formData.status}
            >
              {adminContentStatusValues.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <AdminContentValidationErrors errors={errors} field="status" />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href={`/admin/content/modules/${module.id}`}
        >
          Cancelar
        </Link>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
