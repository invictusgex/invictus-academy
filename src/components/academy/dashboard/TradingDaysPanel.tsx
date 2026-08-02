"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { academyWorkflowConfig } from "@/config/academy-workflow";
import { academyProductSlug } from "@/lib/academy-product";
import type { TradingDay } from "@/lib/types/trading-day.types";

type TradingDaysResponse =
  | {
      tradingDays: TradingDay[];
    }
  | {
      tradingDay: TradingDay;
    }
  | {
      deleted: true;
    }
  | {
      error: {
        code: string;
        message: string;
      };
    };

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getErrorMessage(payload: TradingDaysResponse) {
  return "error" in payload
    ? payload.error.message
    : "No pudimos actualizar tus días de trading.";
}

function formatTradingDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function TradingDaysPanel() {
  const [tradingDays, setTradingDays] = useState<TradingDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradingDate, setTradingDate] = useState(getTodayInputValue);
  const [notes, setNotes] = useState("");
  const [editingRows, setEditingRows] = useState<
    Record<string, { notes: string; tradingDate: string }>
  >({});

  const progressLabel = `${Math.min(
    tradingDays.length,
    academyWorkflowConfig.requiredTradingDays,
  )} de ${academyWorkflowConfig.requiredTradingDays} días`;
  const progressPercent = Math.min(
    100,
    Math.round(
      (tradingDays.length / academyWorkflowConfig.requiredTradingDays) * 100,
    ),
  );

  const sortedTradingDays = useMemo(
    () =>
      [...tradingDays].sort((firstDay, secondDay) =>
        secondDay.tradingDate.localeCompare(firstDay.tradingDate),
      ),
    [tradingDays],
  );

  const loadTradingDays = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/academy/trading-days?productSlug=${academyProductSlug}`,
        {
          cache: "no-store",
        },
      );
      const payload = (await response.json()) as TradingDaysResponse;

      if (!response.ok || !("tradingDays" in payload)) {
        throw new Error(getErrorMessage(payload));
      }

      setTradingDays(payload.tradingDays);
      setEditingRows(
        Object.fromEntries(
          payload.tradingDays.map((day) => [
            day.id,
            {
              notes: day.notes ?? "",
              tradingDate: day.tradingDate,
            },
          ]),
        ),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No pudimos cargar tus días de trading.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTradingDays();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTradingDays]);

  async function submitTradingDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/academy/trading-days", {
        body: JSON.stringify({
          notes,
          productSlug: academyProductSlug,
          tradingDate,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as TradingDaysResponse;

      if (!response.ok || !("tradingDay" in payload)) {
        throw new Error(getErrorMessage(payload));
      }

      setNotes("");
      setTradingDate(getTodayInputValue());
      await loadTradingDays();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No pudimos registrar el dia de trading.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateTradingDay(dayId: string) {
    const draft = editingRows[dayId];

    if (!draft) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/academy/trading-days", {
        body: JSON.stringify({
          id: dayId,
          notes: draft.notes,
          productSlug: academyProductSlug,
          tradingDate: draft.tradingDate,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const payload = (await response.json()) as TradingDaysResponse;

      if (!response.ok || !("tradingDay" in payload)) {
        throw new Error(getErrorMessage(payload));
      }

      await loadTradingDays();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No pudimos editar el dia de trading.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteTradingDay(dayId: string) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/academy/trading-days", {
        body: JSON.stringify({
          id: dayId,
          productSlug: academyProductSlug,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });
      const payload = (await response.json()) as TradingDaysResponse;

      if (!response.ok || !("deleted" in payload)) {
        throw new Error(getErrorMessage(payload));
      }

      await loadTradingDays();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No pudimos eliminar el dia de trading.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[var(--color-border)] bg-black/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              Progreso de práctica
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {progressLabel} registrados
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-cyan-200/25 px-3 py-1 text-sm font-semibold text-[var(--color-cyan)]">
            {progressPercent}%
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            aria-label={progressLabel}
            aria-valuemax={academyWorkflowConfig.requiredTradingDays}
            aria-valuemin={0}
            aria-valuenow={Math.min(
              tradingDays.length,
              academyWorkflowConfig.requiredTradingDays,
            )}
            className="h-full rounded-full bg-[var(--color-cyan)] transition-[width] duration-300 motion-reduce:transition-none"
            role="progressbar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto]"
        onSubmit={submitTradingDay}
      >
        <label className="min-w-0 text-sm font-semibold text-white">
          Fecha
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-black/30 px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)] motion-reduce:transition-none"
            max={getTodayInputValue()}
            onChange={(event) => setTradingDate(event.target.value)}
            required
            type="date"
            value={tradingDate}
          />
        </label>
        <label className="min-w-0 text-sm font-semibold text-white">
          Notas
          <textarea
            className="mt-2 min-h-11 w-full resize-y rounded-xl border border-[var(--color-border)] bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-[var(--color-cyan)] motion-reduce:transition-none"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Contexto, ejecución o aprendizaje del dia"
            rows={1}
            value={notes}
          />
        </label>
        <button
          className="min-h-11 rounded-full bg-[var(--color-cyan)] px-5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:self-end"
          disabled={saving}
          type="submit"
        >
          {saving ? "Guardando..." : "Añadir dia"}
        </button>
      </form>

      {error ? (
        <p className="rounded-xl border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              className="h-28 animate-pulse rounded-2xl border border-[var(--color-border)] bg-white/[0.04] motion-reduce:animate-none"
              key={index}
            />
          ))}
        </div>
      ) : sortedTradingDays.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {sortedTradingDays.map((day) => {
            const draft = editingRows[day.id] ?? {
              notes: day.notes ?? "",
              tradingDate: day.tradingDate,
            };

            return (
              <article
                className="min-w-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
                key={day.id}
              >
                <p className="text-sm font-semibold text-white">
                  {formatTradingDate(day.tradingDate)}
                </p>
                <div className="mt-3 grid gap-3">
                  <input
                    aria-label={`Editar fecha de trading ${formatTradingDate(day.tradingDate)}`}
                    className="min-h-10 w-full rounded-xl border border-[var(--color-border)] bg-black/30 px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)] motion-reduce:transition-none"
                    max={getTodayInputValue()}
                    onChange={(event) =>
                      setEditingRows((currentRows) => ({
                        ...currentRows,
                        [day.id]: {
                          ...draft,
                          tradingDate: event.target.value,
                        },
                      }))
                    }
                    type="date"
                    value={draft.tradingDate}
                  />
                  <textarea
                    aria-label={`Editar notas de trading ${formatTradingDate(day.tradingDate)}`}
                    className="min-h-20 w-full resize-y rounded-xl border border-[var(--color-border)] bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-[var(--color-cyan)] motion-reduce:transition-none"
                    onChange={(event) =>
                      setEditingRows((currentRows) => ({
                        ...currentRows,
                        [day.id]: {
                          ...draft,
                          notes: event.target.value,
                        },
                      }))
                    }
                    placeholder="Sin notas"
                    rows={2}
                    value={draft.notes}
                  />
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                    disabled={saving}
                    onClick={() => void updateTradingDay(day.id)}
                    type="button"
                  >
                    Guardar
                  </button>
                  <button
                    className="min-h-10 rounded-full border border-red-300/25 px-4 text-sm font-semibold text-red-100 transition hover:border-red-200 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                    disabled={saving}
                    onClick={() => void deleteTradingDay(day.id)}
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white/[0.03] p-5 text-sm leading-6 text-[var(--color-text-secondary)]">
          Aun no registraste días de trading. Agrega tus primeras fechas cuando
          hayas completado práctica real de mercado.
        </div>
      )}
    </div>
  );
}
