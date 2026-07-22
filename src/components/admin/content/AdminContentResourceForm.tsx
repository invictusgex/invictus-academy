"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminContentSaveStatus } from "@/components/admin/content/AdminContentSaveStatus";
import { AdminContentResourceValidationErrors } from "@/components/admin/content/AdminContentResourceValidationErrors";
import { AdminContentService } from "@/lib/services/admin-content.service";
import type {
  AdminContentEditableResourceData,
  AdminContentModule,
  AdminContentResource,
  AdminContentResourceValidationError,
} from "@/lib/types/admin-content.types";
import {
  adminContentResourceTypeValues,
  adminContentStatusValues,
} from "@/lib/types/admin-content.types";

type AdminContentResourceFormProps = {
  mode: "create" | "edit";
  module: AdminContentModule;
  resource?: AdminContentResource;
};

function createInitialFormData({
  mode,
  module,
  resource,
}: AdminContentResourceFormProps): AdminContentEditableResourceData {
  return {
    description: resource?.description ?? "",
    position:
      resource?.position ??
      (mode === "create" ? module.resources.length + 1 : null),
    resourceType: resource?.resourceType ?? "pdf",
    status: resource?.status ?? "draft",
    storagePath: resource?.storagePath ?? "",
    title: resource?.title ?? "",
    url: resource?.url ?? "",
  };
}

export function AdminContentResourceForm({
  mode,
  module,
  resource,
}: AdminContentResourceFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<AdminContentResourceValidationError[]>(
    [],
  );
  const [formData, setFormData] = useState(() =>
    createInitialFormData({ mode, module, resource }),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] =
    useState<"idle" | "saving" | "saved" | "error">("idle");
  const positionValue = useMemo(
    () => (formData.position === null ? "" : String(formData.position)),
    [formData.position],
  );
  const detailHref = `/admin/content/modules/${module.id}`;

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
        ? await AdminContentService.createResource(module.id, formData)
        : await AdminContentService.updateResource(
            module.id,
            resource?.id ?? "",
            formData,
          );

    if (result.ok) {
      setSaveStatus("saved");
      router.push(detailHref);
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
            Recursos
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {mode === "create" ? "Agregar recurso" : "Editar recurso"}
          </h2>
        </div>
        <AdminContentSaveStatus status={saveStatus} />
      </div>

      <AdminContentResourceValidationErrors errors={errors} field="general" />

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
          <AdminContentResourceValidationErrors errors={errors} field="title" />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white">
          Descripcion
          <textarea
            className="min-h-28 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={500}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            value={formData.description}
          />
          <AdminContentResourceValidationErrors
            errors={errors}
            field="description"
          />
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
                  resourceType: event.target
                    .value as AdminContentEditableResourceData["resourceType"],
                }))
              }
              value={formData.resourceType}
            >
              {adminContentResourceTypeValues.map((resourceType) => (
                <option key={resourceType} value={resourceType}>
                  {resourceType}
                </option>
              ))}
            </select>
            <AdminContentResourceValidationErrors
              errors={errors}
              field="resourceType"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white">
            Posicion
            <input
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              min={1}
              onChange={(event) => {
                const value = event.target.value;

                setFormData((current) => ({
                  ...current,
                  position: value === "" ? null : Number.parseInt(value, 10),
                }));
              }}
              step={1}
              type="number"
              value={positionValue}
            />
            <AdminContentResourceValidationErrors
              errors={errors}
              field="position"
            />
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
                    .value as AdminContentEditableResourceData["status"],
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
            <AdminContentResourceValidationErrors errors={errors} field="status" />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-white">
          URL
          <input
            className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={500}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                url: event.target.value,
              }))
            }
            type="url"
            value={formData.url}
          />
          <AdminContentResourceValidationErrors errors={errors} field="url" />
        </label>

        <label className="grid gap-2 text-sm font-medium text-white">
          Ruta de archivo
          <input
            className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
            disabled={isSaving}
            maxLength={500}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                storagePath: event.target.value,
              }))
            }
            type="text"
            value={formData.storagePath}
          />
          <AdminContentResourceValidationErrors
            errors={errors}
            field="storagePath"
          />
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          href={detailHref}
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
