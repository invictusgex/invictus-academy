"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

type ResetPasswordFormProps = {
  recoveryVerified: boolean;
};

type ResetPasswordResponse = {
  error?: string;
  message?: string;
};

export function ResetPasswordForm({
  recoveryVerified,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const { initialized, loading, session, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const canResetPassword = Boolean(initialized && recoveryVerified && session);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!canResetPassword) {
      setErrorMessage("Este enlace de recuperación no es válido o ha expirado.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        body: JSON.stringify({
          password,
          passwordConfirmation,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as ResetPasswordResponse;

      if (!response.ok || payload.error) {
        setErrorMessage(
          payload.error ?? "No pudimos actualizar tu contraseña.",
        );
        return;
      }

      setSuccessMessage(
        payload.message ?? "Tu contraseña fue actualizada correctamente.",
      );
      setPassword("");
      setPasswordConfirmation("");
      window.history.replaceState(null, "", "/reset-password");
      await signOut();
      router.refresh();
    } catch {
      setErrorMessage(
        "No pudimos conectar con el servidor. Intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!successMessage && (!initialized || loading)) {
    return (
      <div className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 text-center">
        <p className="text-sm font-medium text-white">
          Validando enlace de recuperación...
        </p>
        <div className="mx-auto mt-5 h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
        <div className="mt-5 h-12 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-5 h-12 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-6 h-12 animate-pulse rounded-full bg-white/10" />
      </div>
    );
  }

  if (!canResetPassword && !successMessage) {
    return (
      <div className="w-full rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-center">
        <p className="text-sm font-medium text-red-100">
          Este enlace de recuperación no es válido o ha expirado.
        </p>
        <Link
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
          href="/forgot-password"
        >
          Solicitar un nuevo enlace
        </Link>
      </div>
    );
  }

  return (
    <form
      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="text-sm font-medium text-white" htmlFor="password">
          Nueva contraseña
        </label>
        <input
          autoComplete="new-password"
          className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
          id="password"
          minLength={8}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          type="password"
          value={password}
        />
      </div>

      <div className="mt-5">
        <label
          className="text-sm font-medium text-white"
          htmlFor="passwordConfirmation"
        >
          Confirmar nueva contraseña
        </label>
        <input
          autoComplete="new-password"
          className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
          id="passwordConfirmation"
          minLength={8}
          name="passwordConfirmation"
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          placeholder="Repite tu nueva contraseña"
          required
          type="password"
          value={passwordConfirmation}
        />
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </p>
      ) : null}

      {successMessage ? (
        <Link
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
          href="/login"
        >
          Iniciar sesión
        </Link>
      ) : (
        <button
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Guardando..." : "Actualizar contraseña"}
        </button>
      )}

      {!successMessage ? (
        <p className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">
          El enlace debe abrirse desde el correo de recuperación para validar tu
          sesión.
        </p>
      ) : null}
    </form>
  );
}
