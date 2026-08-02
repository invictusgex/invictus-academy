"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type ForgotPasswordFormProps = {
  nextPath: string;
};

type ForgotPasswordResponse = {
  error?: string;
  message?: string;
};

export function ForgotPasswordForm({ nextPath }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        body: JSON.stringify({
          email,
          next: nextPath,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as ForgotPasswordResponse;

      if (!response.ok || payload.error) {
        setErrorMessage(payload.error ?? "No pudimos procesar la solicitud.");
        return;
      }

      setSuccessMessage(
        payload.message ??
          "Si el email corresponde a una cuenta, recibiras instrucciones para continuar.",
      );
    } catch {
      setErrorMessage(
        "No pudimos conectar con el servidor. Intenta nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="text-sm font-medium text-white" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
          required
          type="email"
          value={email}
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

      <button
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Enviando..." : "Enviar instrucciones"}
      </button>

      <p className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">
        ¿Recordaste tu contraseña?{" "}
        <Link
          className="font-semibold text-[var(--color-cyan)] transition hover:text-[var(--color-cyan-hover)]"
          href={`/login?next=${encodeURIComponent(nextPath)}`}
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
