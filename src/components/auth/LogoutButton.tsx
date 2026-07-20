"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";

function getFriendlyLogoutError(error: unknown) {
  if (error instanceof Error && error.message) {
    return "No pudimos cerrar la sesion. Intenta nuevamente.";
  }

  return "No pudimos cerrar la sesion. Intenta nuevamente.";
}

export function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogout() {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      setErrorMessage(getFriendlyLogoutError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-sm font-medium text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
        onClick={handleLogout}
        type="button"
      >
        {submitting ? "Cerrando sesion..." : "Cerrar sesion"}
      </button>

      {errorMessage ? (
        <p className="max-w-56 text-right text-xs leading-5 text-red-100">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
