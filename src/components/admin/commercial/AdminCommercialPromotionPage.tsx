"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { AdminStatusMessage } from "@/components/admin/ui/AdminStatusMessage";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { CommercialPromotionService } from "@/lib/services/commercial-promotion.service";
import type {
  CommercialPromotion,
  CommercialPromotionInput,
} from "@/lib/types/promotion.types";

type FormState = {
  checkoutDescription: string;
  checkoutInstruction: string;
  checkoutTitle: string;
  code: string;
  discountLabel: string;
  endsAt: string;
  headline: string;
  isActive: boolean;
  message: string;
  startsAt: string;
};

function getDateInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function toFormState(promotion: CommercialPromotion): FormState {
  return {
    checkoutDescription: promotion.checkoutDescription,
    checkoutInstruction: promotion.checkoutInstruction,
    checkoutTitle: promotion.checkoutTitle,
    code: promotion.code,
    discountLabel: promotion.discountLabel,
    endsAt: getDateInputValue(promotion.endsAt),
    headline: promotion.headline,
    isActive: promotion.isActive,
    message: promotion.message,
    startsAt: getDateInputValue(promotion.startsAt),
  };
}

function toInput(form: FormState): CommercialPromotionInput {
  return {
    checkoutDescription: form.checkoutDescription,
    checkoutInstruction: form.checkoutInstruction,
    checkoutTitle: form.checkoutTitle,
    code: form.code,
    discountLabel: form.discountLabel,
    endsAt: form.endsAt ? `${form.endsAt}T23:59:59` : null,
    headline: form.headline,
    isActive: form.isActive,
    message: form.message,
    startsAt: form.startsAt ? `${form.startsAt}T00:00:00` : null,
  };
}

export function AdminCommercialPromotionPage() {
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const loadPromotion = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const promotion =
        await CommercialPromotionService.getPrimaryPromotionForAdmin();

      setForm(toFormState(promotion));
    } catch {
      setError("No fue posible cargar la promoción vigente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPromotion();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadPromotion]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    const result = await CommercialPromotionService.savePrimaryPromotion(
      toInput(form),
    );

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setForm(toFormState(result.promotion));
    setSuccess("Promoción actualizada correctamente.");
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Comercial" title="Promoción vigente">
        Gestiona el código visible, el tipo de descuento y los mensajes que se
        muestran antes de enviar al alumno a Stripe Checkout.
      </AdminPageHeader>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
        {loading ? (
          <p className="text-sm text-[var(--color-text-secondary)]">
            Cargando promoción...
          </p>
        ) : null}

        {error ? (
          <div className="mb-5">
            <AdminStatusMessage tone="error">{error}</AdminStatusMessage>
          </div>
        ) : null}

        {success ? (
          <div className="mb-5">
            <AdminStatusMessage tone="success">{success}</AdminStatusMessage>
          </div>
        ) : null}

        {form ? (
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="flex items-center gap-3 text-sm font-medium text-white">
              <input
                checked={form.isActive}
                className="h-4 w-4 accent-[var(--color-cyan)]"
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? { ...current, isActive: event.target.checked }
                      : current,
                  )
                }
                type="checkbox"
              />
              Promoción activa
            </label>

            <div className="grid gap-5 lg:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-white">
                Código promocional
                <input
                  className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                  onChange={(event) =>
                    setForm({ ...form, code: event.target.value })
                  }
                  value={form.code}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-white">
                Tipo de descuento visible
                <input
                  className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                  onChange={(event) =>
                    setForm({ ...form, discountLabel: event.target.value })
                  }
                  value={form.discountLabel}
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-white">
              Mensaje principal
              <input
                className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                onChange={(event) =>
                  setForm({ ...form, headline: event.target.value })
                }
                value={form.headline}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-white">
              Mensaje de la cinta superior
              <input
                className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                onChange={(event) =>
                  setForm({ ...form, message: event.target.value })
                }
                value={form.message}
              />
            </label>

            <div className="grid gap-5 lg:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-white">
                Inicio opcional
                <input
                  className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                  onChange={(event) =>
                    setForm({ ...form, startsAt: event.target.value })
                  }
                  type="date"
                  value={form.startsAt}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-white">
                Cierre opcional
                <input
                  className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                  onChange={(event) =>
                    setForm({ ...form, endsAt: event.target.value })
                  }
                  type="date"
                  value={form.endsAt}
                />
              </label>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
              <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
                Pantalla previa a Stripe
              </p>
              <div className="mt-5 grid gap-5">
                <label className="grid gap-2 text-sm font-medium text-white">
                  Título
                  <input
                    className="min-h-11 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                    onChange={(event) =>
                      setForm({ ...form, checkoutTitle: event.target.value })
                    }
                    value={form.checkoutTitle}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-white">
                  Descripción
                  <textarea
                    className="min-h-28 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-3 py-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        checkoutDescription: event.target.value,
                      })
                    }
                    value={form.checkoutDescription}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-white">
                  Instrucción
                  <textarea
                    className="min-h-28 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-3 py-3 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        checkoutInstruction: event.target.value,
                      })
                    }
                    value={form.checkoutInstruction}
                  />
                </label>
              </div>
            </div>

            <AdminStatusMessage>
              La aplicación solo muestra este código. El descuento real debe
              existir como Promotion Code activo dentro de Stripe.
            </AdminStatusMessage>

            <button
              className="min-h-12 w-full rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
              disabled={saving}
              type="submit"
            >
              {saving ? "Guardando..." : "Guardar promoción"}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
