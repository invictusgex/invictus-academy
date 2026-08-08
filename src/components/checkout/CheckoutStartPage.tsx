"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type CheckoutStartPageProps = {
  productSlug: string;
};

type CheckoutResponse =
  | {
      url: string;
    }
  | {
      error: {
        code: string;
        message: string;
      };
    };

export function CheckoutStartPage({ productSlug }: CheckoutStartPageProps) {
  const router = useRouter();
  const startedRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    async function startCheckout() {
      setErrorMessage(null);

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
      }
    }

    void startCheckout();
  }, [productSlug, router]);

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
          Estamos abriendo el proceso de pago seguro para continuar con tu
          acceso a Invictus GEX.
        </p>

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
        ) : (
          <p className="mt-6 text-sm text-[var(--color-cyan)]">
            Redirigiendo a Stripe Checkout...
          </p>
        )}
      </section>
    </main>
  );
}
