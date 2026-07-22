"use client";

import { ChangeEvent, useEffect, useId, useRef, useState } from "react";

import { AdminFilePreview } from "@/components/admin/storage/AdminFilePreview";
import { AdminRemoveSelectedFileButton } from "@/components/admin/storage/AdminRemoveSelectedFileButton";
import { AdminUploadStatus } from "@/components/admin/storage/AdminUploadStatus";
import { StorageService } from "@/lib/services/storage.service";
import type { AcademyAssetKind } from "@/lib/types/storage.types";

type AdminFileUploadFieldProps = {
  accept: string;
  allowedKinds: AcademyAssetKind[];
  disabled?: boolean;
  helpText: string;
  label: string;
  mode: "document" | "image";
  onChange: (path: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  resolveKind: (file: File) => AcademyAssetKind | null;
  value: string;
};

type SelectedFileDetails = {
  name: string;
  size: string;
  type: string;
};

export function AdminFileUploadField({
  accept,
  allowedKinds,
  disabled = false,
  helpText,
  label,
  mode,
  onChange,
  onUploadStateChange,
  resolveKind,
  value,
}: AdminFileUploadFieldProps) {
  const initialValue = useRef(value);
  const inputId = useId();
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] =
    useState<"error" | "idle" | "success" | "uploading" | "validating">(
      "idle",
    );
  const [selectedFileDetails, setSelectedFileDetails] =
    useState<SelectedFileDetails | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  function replaceLocalPreview(nextPreviewUrl: string | null) {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    setLocalPreviewUrl(nextPreviewUrl);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    setStatus("validating");
    setMessage("Validando archivo...");
    setSelectedFileDetails({
      name: file.name,
      size: StorageService.formatFileSize(file.size),
      type: file.type || "tipo no declarado",
    });

    const kind = resolveKind(file);

    if (!kind || !allowedKinds.includes(kind)) {
      setStatus("error");
      setMessage("El archivo seleccionado no corresponde a este campo.");
      event.target.value = "";
      return;
    }

    replaceLocalPreview(mode === "image" ? URL.createObjectURL(file) : null);
    setStatus("uploading");
    setMessage("Subiendo archivo...");
    onUploadStateChange?.(true);

    const result = await StorageService.uploadFile({
      file,
      filename: file.name,
      kind,
    });

    onUploadStateChange?.(false);

    if (result.ok) {
      setUploadedPath(result.path);
      setStatus("success");
      setMessage("Archivo subido. Guarda el formulario para conservarlo.");
      onChange(result.path);
    } else {
      replaceLocalPreview(null);
      setStatus("error");
      setMessage(result.message);
    }

    event.target.value = "";
  }

  function handleRemoveSelected() {
    replaceLocalPreview(null);
    setSelectedFileDetails(null);
    setUploadedPath(null);
    setStatus("idle");
    setMessage(null);
    onUploadStateChange?.(false);
    onChange(initialValue.current);
  }

  const isUploading = status === "uploading" || status === "validating";
  const showRemoveButton = Boolean(uploadedPath || localPreviewUrl);

  return (
    <div className="grid gap-3 text-sm font-medium text-white">
      <label className="grid gap-2" htmlFor={inputId}>
        {label}
        <input
          accept={accept}
          className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-2 text-sm text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[var(--color-cyan)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-page-bg)] hover:file:bg-[var(--color-cyan-hover)] focus:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || isUploading}
          id={inputId}
          onChange={handleFileChange}
          type="file"
        />
      </label>

      <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
        {helpText}
      </p>

      <AdminFilePreview
        allowedKinds={allowedKinds}
        alt={label}
        localPreviewUrl={localPreviewUrl}
        mode={mode}
        value={value}
      />

      {selectedFileDetails ? (
        <dl className="grid gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-3 text-xs text-[var(--color-text-secondary)]">
          <div>
            <dt className="font-semibold text-white">Archivo seleccionado</dt>
            <dd className="mt-1 break-all">{selectedFileDetails.name}</dd>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <div>
              <dt className="font-semibold text-white">Tipo</dt>
              <dd>{selectedFileDetails.type}</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Tamano</dt>
              <dd>{selectedFileDetails.size}</dd>
            </div>
          </div>
        </dl>
      ) : null}

      {value ? (
        <p className="break-all text-xs text-[var(--color-text-secondary)]">
          Ruta guardada: {value}
        </p>
      ) : null}

      <AdminUploadStatus message={message} status={status} />

      {showRemoveButton ? (
        <AdminRemoveSelectedFileButton
          disabled={disabled || isUploading}
          onClick={handleRemoveSelected}
        />
      ) : null}
    </div>
  );
}
