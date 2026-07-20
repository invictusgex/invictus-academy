"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

function getFriendlyAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Invalid login credentials")) {
      return "El email o la contrasena no son correctos.";
    }

    if (error.message.includes("Email not confirmed")) {
      return "Debes confirmar tu email antes de iniciar sesion.";
    }

    if (error.message.includes("Supabase Auth is not configured")) {
      return "La autenticacion todavia no esta configurada en este entorno.";
    }
  }

  return "No pudimos iniciar sesion. Revisa tus datos e intenta nuevamente.";
}

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await signIn({ email, password });
      router.push("/academy");
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6"
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

      <div className="mt-5">
        <label className="text-sm font-medium text-white" htmlFor="password">
          Contrasena
        </label>
        <input
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
          id="password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Ingresa tu contrasena"
          required
          type="password"
          value={password}
        />
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </p>
      ) : null}

      <button
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Iniciando sesion..." : "Iniciar sesion"}
      </button>
    </form>
  );
}
