"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";

export type RequireAuthState =
  | "loading"
  | "initialized"
  | "authenticated"
  | "unauthenticated";

export type RequireAuthProps = {
  children: ReactNode;
  loadingFallback?: ReactNode;
};

function DefaultLoadingFallback() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[var(--color-page-bg)] px-5">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-6 py-5 text-center">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Verificando acceso...
        </p>
      </div>
    </main>
  );
}

// RequireAuth es el primer filtro real de acceso privado.
// Consume solo useAuth, evita redirigir durante render y nunca toca Supabase.
export function RequireAuth({
  children,
  loadingFallback = <DefaultLoadingFallback />,
}: RequireAuthProps) {
  const router = useRouter();
  const { user, loading, initialized } = useAuth();

  const state: RequireAuthState = loading
    ? "loading"
    : !initialized
      ? "initialized"
      : user
        ? "authenticated"
        : "unauthenticated";

  useEffect(() => {
    if (state === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, state]);

  if (state === "loading" || state === "initialized") {
    return loadingFallback;
  }

  if (state === "unauthenticated") {
    return null;
  }

  return children;
}
