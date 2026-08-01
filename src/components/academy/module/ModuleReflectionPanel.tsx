"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import type { ModuleReflection } from "@/lib/types/module-reflection.types";

type ModuleReflectionPanelProps = {
  moduleKey: string;
  productSlug: string;
};

type ReflectionResponse =
  | {
      reflection: ModuleReflection | null;
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

export function ModuleReflectionPanel({
  moduleKey,
  productSlug,
}: ModuleReflectionPanelProps) {
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
          throw new Error("No se pudo cargar la reflexión del módulo.");
        }

        if (!cancelled) {
          setContent(payload.reflection?.content ?? "");
          setUpdatedAt(payload.reflection?.updatedAt ?? null);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("No se pudo cargar la reflexión del módulo.");
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
        throw new Error("No se pudo guardar la reflexión del módulo.");
      }

      setContent(payload.reflection.content);
      setUpdatedAt(payload.reflection.updatedAt);
      setSaved(true);
    } catch {
      setErrorMessage("No se pudo guardar la reflexión del módulo.");
    } finally {
      setSaving(false);
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
            la preparación de tu sesión.
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
                Aún no has documentado ninguna reflexión en este módulo.
              </p>
            ) : null}
            <p
              className="mt-4 text-xs leading-5 text-[var(--color-text-muted)]"
              id="module-reflection-privacy"
            >
              Esta información será revisada únicamente por tu mentor y
              utilizada para preparar tu sesión personalizada.
            </p>
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
