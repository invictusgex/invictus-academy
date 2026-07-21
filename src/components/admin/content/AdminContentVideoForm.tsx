"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminContentSaveStatus } from "@/components/admin/content/AdminContentSaveStatus";
import { AdminContentVideoValidationErrors } from "@/components/admin/content/AdminContentVideoValidationErrors";
import { AdminContentService } from "@/lib/services/admin-content.service";
import type {
  AdminContentEditableVideoData,
  AdminContentModule,
  AdminContentVideo,
  AdminContentVideoValidationError,
} from "@/lib/types/admin-content.types";
import {
  adminContentStatusValues,
  adminContentVideoProviderValues,
} from "@/lib/types/admin-content.types";

type AdminContentVideoFormProps = {
  module: AdminContentModule;
  mode: "create" | "edit";
  video?: AdminContentVideo;
};

function createInitialFormData({
  mode,
  module,
  video,
}: AdminContentVideoFormProps): AdminContentEditableVideoData {
  return {
    durationSeconds: video?.durationSeconds ?? null,
    position:
      video?.position ??
      (mode === "create" ? module.videos.length + 1 : null),
    provider: video?.provider ?? "youtube",
    providerVideoId: video?.providerVideoId ?? "",
    status: video?.status ?? "draft",
    thumbnailUrl: video?.thumbnailUrl ?? "",
    title: video?.title ?? "",
  };
}

export function AdminContentVideoForm({
  mode,
  module,
  video,
}: AdminContentVideoFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<AdminContentVideoValidationError[]>([]);
  const [formData, setFormData] = useState(() =>
    createInitialFormData({ mode, module, video }),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] =
    useState<"idle" | "saving" | "saved" | "error">("idle");
  const durationValue = useMemo(
    () =>
      formData.durationSeconds === null ? "" : String(formData.durationSeconds),
    [formData.durationSeconds],
  );
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
        ? await AdminContentService.createVideo(module.id, formData)
        : await AdminContentService.updateVideo(module.id, video?.id ?? "", formData);

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
            Videos
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {mode === "create" ? "Agregar video" : "Editar video"}
          </h2>
        </div>
        <AdminContentSaveStatus status={saveStatus} />
      </div>

      <AdminContentVideoValidationErrors errors={errors} field="general" />

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
          <AdminContentVideoValidationErrors errors={errors} field="title" />
        </label>

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-white">
            Proveedor
            <select
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  provider: event.target
                    .value as AdminContentEditableVideoData["provider"],
                }))
              }
              value={formData.provider}
            >
              {adminContentVideoProviderValues.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
            <AdminContentVideoValidationErrors errors={errors} field="provider" />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white">
            Identificador o URL
            <input
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              maxLength={300}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  providerVideoId: event.target.value,
                }))
              }
              type="text"
              value={formData.providerVideoId}
            />
            <AdminContentVideoValidationErrors
              errors={errors}
              field="providerVideoId"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-white">
          URL de miniatura
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
          <AdminContentVideoValidationErrors errors={errors} field="thumbnailUrl" />
        </label>

        <div className="grid gap-5 lg:grid-cols-3">
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
            <AdminContentVideoValidationErrors errors={errors} field="position" />
          </label>

          <label className="grid gap-2 text-sm font-medium text-white">
            Duracion
            <input
              className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
              disabled={isSaving}
              min={0}
              onChange={(event) => {
                const value = event.target.value;

                setFormData((current) => ({
                  ...current,
                  durationSeconds:
                    value === "" ? null : Number.parseInt(value, 10),
                }));
              }}
              step={1}
              type="number"
              value={durationValue}
            />
            <AdminContentVideoValidationErrors
              errors={errors}
              field="durationSeconds"
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
                    .value as AdminContentEditableVideoData["status"],
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
            <AdminContentVideoValidationErrors errors={errors} field="status" />
          </label>
        </div>
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
