import Link from "next/link";

import type { ActiveEnrollmentProduct } from "@/lib/types/enrollment.types";

type CheckoutSuccessPageProps = {
  products: ActiveEnrollmentProduct[];
};

function CheckoutRecoveryState() {
  return (
    <section className="w-full max-w-xl rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-6 py-8 text-center shadow-2xl shadow-black/20 sm:px-8">
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Pago en proceso
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-white">
        Estamos terminando de preparar tu acceso.
      </h1>
      <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
        En unos segundos deberias ver tu programa activo. Puedes actualizar
        esta pantalla para volver a comprobarlo.
      </p>
      <form action="/checkout/success" className="mt-8">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--color-cyan-line)] px-5 text-sm font-semibold text-[var(--color-cyan)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-bg)] focus-visible:outline-none"
        >
          Actualizar
        </button>
      </form>
    </section>
  );
}

function CheckoutConfirmedState({ products }: CheckoutSuccessPageProps) {
  return (
    <section className="w-full max-w-2xl rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-6 py-8 shadow-2xl shadow-black/20 sm:px-8">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-cyan-line)] bg-[var(--color-chart-surface)] text-xl font-semibold text-[var(--color-cyan)]">
        ✓
      </div>
      <p className="mt-5 text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Pago confirmado
      </p>
      <div className="mt-4 space-y-3">
        {products.map((product) => (
          <h1
            key={product.enrollmentId}
            className="text-3xl font-semibold text-white sm:text-4xl"
          >
            {product.productTitle}
          </h1>
        ))}
      </div>
      <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
        Tu acceso ha sido concedido correctamente.
      </p>
      <div className="mt-8">
        <Link
          href="/academy"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition-colors hover:bg-[var(--color-cyan-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-page-bg)] focus-visible:outline-none"
        >
          Ir a la Academia
        </Link>
      </div>
    </section>
  );
}

export function CheckoutSuccessPage({ products }: CheckoutSuccessPageProps) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[var(--color-page-bg)] px-5 py-16">
      {products.length > 0 ? (
        <CheckoutConfirmedState products={products} />
      ) : (
        <CheckoutRecoveryState />
      )}
    </main>
  );
}
