"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type RegisterFormProps = {
  nextPath: string;
};

type RegisterResponse = {
  error?: string;
  message?: string;
};

async function readResponse(response: Response): Promise<RegisterResponse> {
  return (await response.json()) as RegisterResponse;
}

export function RegisterForm({ nextPath }: RegisterFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        body: JSON.stringify({
          acceptedTerms,
          email,
          fullName,
          next: nextPath,
          password,
          passwordConfirmation,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = await readResponse(response);

      if (!response.ok || payload.error) {
        setErrorMessage(
          payload.error ??
            "No pudimos crear tu cuenta. Intenta nuevamente en unos minutos.",
        );
        return;
      }

      setSuccessMessage(
        payload.message ??
          "Revisa tu email para confirmar tu cuenta antes de iniciar sesion.",
      );
      setPassword("");
      setPasswordConfirmation("");
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
        <label className="text-sm font-medium text-white" htmlFor="fullName">
          Nombre completo
        </label>
        <input
          autoComplete="name"
          className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
          id="fullName"
          name="fullName"
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Tu nombre"
          required
          type="text"
          value={fullName}
        />
      </div>

      <div className="mt-5">
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
          autoComplete="new-password"
          className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
          id="password"
          minLength={8}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimo 8 caracteres"
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
          Confirmar contrasena
        </label>
        <input
          autoComplete="new-password"
          className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-cyan)]"
          id="passwordConfirmation"
          minLength={8}
          name="passwordConfirmation"
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          placeholder="Repite tu contrasena"
          required
          type="password"
          value={passwordConfirmation}
        />
      </div>

      <label className="mt-5 flex gap-3 text-sm leading-6 text-[var(--color-text-secondary)]">
        <input
          checked={acceptedTerms}
          className="mt-1 h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-surface)] accent-[var(--color-cyan)]"
          onChange={(event) => setAcceptedTerms(event.target.checked)}
          required
          type="checkbox"
        />
        <span>
          Acepto los terminos de uso y la politica de privacidad de Invictus
          Trading Academy.
        </span>
      </label>

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
        {submitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="mt-5 text-center text-sm text-[var(--color-text-secondary)]">
        Ya tienes cuenta?{" "}
        <Link
          className="font-semibold text-[var(--color-cyan)] transition hover:text-[var(--color-cyan-hover)]"
          href={`/login?next=${encodeURIComponent(nextPath)}`}
        >
          Inicia sesion
        </Link>
      </p>
    </form>
  );
}
