"use client";

import type { ReactNode } from "react";

import { EnrollmentAccessDenied } from "@/components/auth/EnrollmentAccessDenied";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollmentAccess } from "@/hooks/useEnrollmentAccess";

export type RequireEnrollmentState = "loading" | "hasProgramAccess" | "noAccess";

export type RequireEnrollmentProps = {
  children: ReactNode;
  productSlug: string;
};

function EnrollmentLoadingFallback() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[var(--color-page-bg)] px-5">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-6 py-5 text-center">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Verificando acceso a la formacion...
        </p>
      </div>
    </main>
  );
}

// RequireEnrollment es el segundo filtro privado: autorizacion por enrollment.
// Consume un hook de dominio; no conoce Supabase, tablas ni reglas SQL.
export function RequireEnrollment({
  children,
  productSlug,
}: RequireEnrollmentProps) {
  const { user } = useAuth();
  const access = useEnrollmentAccess({
    profileId: user?.id ?? null,
    productSlug,
  });

  const state: RequireEnrollmentState = access.loading
    ? "loading"
    : access.hasAccess
      ? "hasProgramAccess"
      : "noAccess";

  if (state === "loading") {
    return <EnrollmentLoadingFallback />;
  }

  if (state === "noAccess") {
    return (
      <EnrollmentAccessDenied
        onRetry={access.retry}
        reason={access.reason}
        technicalError={Boolean(access.error)}
      />
    );
  }

  return children;
}
