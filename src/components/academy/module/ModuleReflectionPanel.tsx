"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type {
  ModuleReflection,
  ModuleReflectionAttachment,
} from "@/lib/types/module-reflection.types";

type ModuleReflectionPanelProps = {
  moduleKey: string;
  productSlug: string;
};

type ReflectionResponse =
  | {
      reflection: ModuleReflection | null;
    }
  | {
      attachment: ModuleReflectionAttachment;
    }
  | {
      ok: true;
    }
  | {
      error: {
        code: string;
        message: string;
      };
    };

function assertReflectionResponse(
  response: ReflectionResponse,
): asserts response is { reflection: ModuleReflection | null } {
  if ("error" in response) {
    throw new Error(response.error.message);
  }
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatFileSize(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
}

export function ModuleReflectionPanel({
  moduleKey,
  productSlug,
}: ModuleReflectionPanelProps) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<ModuleReflectionAttachment[]>([]);
  const [attachmentMessage, setAttachmentMessage] = useState<string | null>(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const updatedAtLabel = useMemo(
    () => (updatedAt ? formatUpdatedAt(updatedAt) : null),
    [updatedAt],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadReflection() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const params = new URLSearchParams({
          moduleKey,
          productSlug,
        });
        const response = await fetch(
          `/api/academy/module-reflections?${params.toString()}`,
          {
            cache: "no-store",
          },
        );
        const payload = (await response.json()) as ReflectionResponse;

        assertReflectionResponse(payload);

        if (!response.ok) {
          throw new Error("No se pudo cargar la reflexión de la etapa.");
        }

        if (!cancelled) {
          setContent(payload.reflection?.content ?? "");
          setAttachments(payload.reflection?.attachments ?? []);
          setUpdatedAt(payload.reflection?.updatedAt ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudo cargar la reflexión de la etapa.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReflection();

    return () => {
      cancelled = true;
    };
  }, [moduleKey, productSlug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/academy/module-reflections", {
        body: JSON.stringify({
          content,
          moduleKey,
          productSlug,
        }),
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as ReflectionResponse;

      assertReflectionResponse(payload);

      if (!response.ok || !payload.reflection) {
        throw new Error("No se pudo guardar la reflexión de la etapa.");
      }

      setContent(payload.reflection.content);
      setAttachments(payload.reflection.attachments ?? []);
      setUpdatedAt(payload.reflection.updatedAt);
      setSaved(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la reflexión de la etapa.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    const availableSlots = Math.max(0, 5 - attachments.length);
    const filesToUpload = selectedFiles.slice(0, availableSlots);

    setAttachmentMessage(null);

    if (filesToUpload.length < selectedFiles.length) {
      setAttachmentMessage("Solo puedes adjuntar hasta 5 imágenes.");
    }

    for (const file of filesToUpload) {
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("productSlug", productSlug);
        formData.append("moduleKey", moduleKey);
        formData.append("file", file);

        const response = await fetch("/api/academy/module-reflections", {
          body: formData,
          cache: "no-store",
          method: "POST",
        });
        const payload = (await response.json()) as ReflectionResponse;

        if ("error" in payload) {
          throw new Error(payload.error.message);
        }

        if (!response.ok || !("attachment" in payload)) {
          throw new Error("No se pudo adjuntar la imagen.");
        }

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          payload.attachment,
        ]);
      } catch (error) {
        setAttachmentMessage(
          error instanceof Error
            ? error.message
            : "No se pudo adjuntar la imagen.",
        );
      } finally {
        setUploading(false);
      }
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    setDeletingAttachmentId(attachmentId);
    setAttachmentMessage(null);

    try {
      const response = await fetch("/api/academy/module-reflections", {
        body: JSON.stringify({
          attachmentId,
          moduleKey,
          productSlug,
        }),
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });
      const payload = (await response.json()) as ReflectionResponse;

      if ("error" in payload) {
        throw new Error(payload.error.message);
      }

      if (!response.ok) {
        throw new Error("No se pudo eliminar la imagen.");
      }

      setAttachments((currentAttachments) =>
        currentAttachments.filter((attachment) => attachment.id !== attachmentId),
      );
    } catch (error) {
      setAttachmentMessage(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la imagen.",
      );
    } finally {
      setDeletingAttachmentId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Expediente de formación
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Tu mentoría comienza aquí
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
            Cada observación que documentes durante el programa será utilizada
            para preparar tu mentoría individual. Registra con honestidad las
            dudas, ejemplos o conceptos que quieras comprender o reforzar.
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            Cuanta más claridad aportes sobre tu proceso, más precisa podrá ser
            la preparación de tu mentoría.
          </p>
        </div>
        {updatedAtLabel ? (
          <p className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-text-muted)]">
            Actualizada {updatedAtLabel}
          </p>
        ) : null}
      </div>

      <div className="mt-8 border-t border-[var(--color-border)] pt-6">
        {loading ? (
          <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4 text-sm text-[var(--color-text-secondary)]">
            Cargando reflexión...
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <textarea
              aria-describedby="module-reflection-privacy"
              aria-label="Tu mentoría comienza aquí"
              className="min-h-60 w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)] sm:min-h-72 sm:px-5"
              onChange={(event) => {
                setContent(event.target.value);
                setSaved(false);
              }}
              placeholder="Documenta libremente tus dudas, observaciones, ejemplos del mercado o conceptos que quieras revisar durante la mentoría."
              value={content}
            />
            {!content.trim() ? (
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">
                Aún no has documentado ninguna reflexión en esta etapa.
              </p>
            ) : null}
            <p
              className="mt-4 text-xs leading-5 text-[var(--color-text-muted)]"
              id="module-reflection-privacy"
            >
              Esta información será revisada únicamente por tu mentor y
              utilizada para preparar tu mentoría personalizada.
            </p>
            <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Imágenes adjuntas
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                    Puedes adjuntar capturas o ejemplos del mercado que quieras
                    revisar durante tu mentoría.
                  </p>
                </div>
                <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)]">
                  <span>{uploading ? "Adjuntando..." : "Adjuntar imágenes"}</span>
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={uploading || attachments.length >= 5}
                    multiple
                    onChange={handleAttachmentChange}
                    type="file"
                  />
                </label>
              </div>
              {attachments.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {attachments.map((attachment) => (
                    <article
                      className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)]"
                      key={attachment.id}
                    >
                      {attachment.signedUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={attachment.originalName}
                          className="h-40 w-full object-cover"
                          src={attachment.signedUrl}
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center bg-[var(--color-panel-bg)] px-4 text-center text-sm text-[var(--color-text-muted)]">
                          Vista previa no disponible.
                        </div>
                      )}
                      <div className="space-y-3 p-4">
                        <div>
                          <p className="truncate text-sm font-medium text-white">
                            {attachment.originalName}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                            {formatFileSize(attachment.sizeBytes)}
                          </p>
                        </div>
                        <button
                          className="inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-xs font-semibold text-white transition hover:border-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={deletingAttachmentId === attachment.id}
                          onClick={() => {
                            void handleDeleteAttachment(attachment.id);
                          }}
                          type="button"
                        >
                          {deletingAttachmentId === attachment.id
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
              {attachmentMessage ? (
                <p className="mt-4 text-sm font-medium text-red-200">
                  {attachmentMessage}
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div aria-live="polite" className="min-h-5 text-sm">
                {saved ? (
                  <span className="font-medium text-[var(--color-cyan)]">
                    Incorporado a tu expediente de formación
                  </span>
                ) : null}
                {errorMessage ? (
                  <span className="font-medium text-red-200">
                    {errorMessage}
                  </span>
                ) : null}
              </div>
              <button
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                disabled={saving}
                type="submit"
              >
                {saving ? "Guardando..." : "Guardar en mi expediente"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
