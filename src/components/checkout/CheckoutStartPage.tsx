"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CheckoutStartPageProps = {
  productSlug: string;
};

type CheckoutResponse =
  | {
      url: string;
      recoveredPendingSession?: boolean;
    }
  | {
      error: {
        code: string;
        message: string;
      };
    };

export function CheckoutStartPage({ productSlug }: CheckoutStartPageProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState<string | null>(
    null,
  );

  async function startCheckout() {
    if (isStartingCheckout) {
      return;
    }

    setErrorMessage(null);
    setIsStartingCheckout(true);
    setPendingCheckoutUrl(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        body: JSON.stringify({ productSlug }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as CheckoutResponse;

      if ("url" in payload) {
        if (payload.recoveredPendingSession) {
          setPendingCheckoutUrl(payload.url);
          setIsStartingCheckout(false);
          return;
        }

        window.location.assign(payload.url);
        return;
      }

      if (payload.error.code === "ALREADY_ENROLLED") {
        router.replace("/academy");
        return;
      }

      if (payload.error.code === "UNAUTHENTICATED") {
        router.replace(
          `/login?next=${encodeURIComponent("/checkout/start")}`,
        );
        return;
      }

      setErrorMessage(
        payload.error.message ||
          "No pudimos iniciar el proceso de pago. Intenta nuevamente.",
      );
    } catch {
      setErrorMessage(
        "No pudimos conectar con el servidor. Intenta nuevamente.",
      );
    } finally {
      setIsStartingCheckout(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-page-bg)] px-5 py-16 text-[var(--color-text-primary)]">
      <section className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 text-center">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Acceso al programa
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          Preparando tu formación
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
          Antes de continuar al pago seguro, recuerda aplicar el cupón vigente
          dentro de Stripe Checkout.
        </p>

        <div className="mt-6 rounded-2xl border border-[var(--color-cyan)]/45 bg-[var(--color-cyan)]/10 px-4 py-5 text-left shadow-[0_0_32px_rgba(34,211,238,0.12)]">
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Descuento disponible
          </p>
          <div className="mt-3 flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-black/25 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                Usa este código antes de finalizar tu compra:
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[0.16em] text-white">
                GEX10
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full border border-[var(--color-cyan)]/50 px-3 py-1 text-xs font-semibold text-[var(--color-cyan)]">
              350 USD de descuento
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            En la pantalla de Stripe, busca el campo de código promocional y
            escribe <strong className="font-semibold text-white">GEX10</strong>{" "}
            para acceder a la academia con el descuento aplicado.
          </p>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
            <p>{errorMessage}</p>
            <Link
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
              href="/oferta"
            >
              Volver a la oferta
            </Link>
          </div>
        ) : pendingCheckoutUrl ? (
          <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-white/5 px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            <h2 className="text-lg font-semibold text-white">
              Tu proceso de pago sigue disponible.
            </h2>
            <a
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
              href={pendingCheckoutUrl}
            >
              Continuar con el pago
            </a>
            <Link
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)]"
              href="/oferta"
            >
              Volver a la oferta
            </Link>
          </div>
        ) : (
          <button
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isStartingCheckout}
            onClick={startCheckout}
            type="button"
          >
            {isStartingCheckout
              ? "Abriendo Stripe Checkout..."
              : "Continuar a Stripe Checkout"}
          </button>
        )}
      </section>
    </main>
  );
}
