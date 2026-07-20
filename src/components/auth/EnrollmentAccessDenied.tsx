"use client";

import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";
import type { EnrollmentAccessReason } from "@/lib/types/enrollment.types";

type EnrollmentAccessDeniedProps = {
  onRetry: () => void;
  reason: EnrollmentAccessReason | null;
  technicalError: boolean;
};

const reasonMessages: Record<EnrollmentAccessReason, string> = {
  expired: "El acceso asociado a esta cuenta ha expirado.",
  inactive: "El acceso asociado a esta cuenta no esta activo.",
  not_found: "No encontramos un acceso asociado a esta cuenta.",
  not_started: "El acceso todavia no ha comenzado.",
  revoked: "El acceso asociado a esta cuenta no esta activo.",
};

export function EnrollmentAccessDenied({
  onRetry,
  reason,
  technicalError,
}: EnrollmentAccessDeniedProps) {
  const message = technicalError
    ? "No pudimos verificar tu acceso en este momento."
    : reasonMessages[reason ?? "not_found"];

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[var(--color-page-bg)] px-5">
      <section className="w-full max-w-xl rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-2xl shadow-black/20">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-cyan)]">
            Acceso privado
          </p>
          <h1 className="text-2xl font-semibold text-white">
            Acceso no habilitado
          </h1>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            Tu cuenta inicio sesion correctamente, pero no tiene acceso activo a
            esta formacion.
          </p>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            {message}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
            href="/oferta"
          >
            Ver informacion de acceso
          </Link>

          {technicalError ? (
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)]"
              onClick={onRetry}
              type="button"
            >
              Intentar de nuevo
            </button>
          ) : null}

          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </section>
    </main>
  );
}
