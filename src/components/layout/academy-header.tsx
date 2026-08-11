"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAuth } from "@/hooks/useAuth";

function getInitialsFromName(fullName: string) {
  const nameParts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (nameParts.length === 0) {
    return null;
  }

  const firstInitial = nameParts[0]?.[0] ?? "";
  const secondInitial =
    nameParts.length > 1
      ? nameParts[nameParts.length - 1]?.[0] ?? ""
      : nameParts[0]?.[1] ?? "";
  const initials = `${firstInitial}${secondInitial}`.toUpperCase();

  return initials || null;
}

function getInitialsFromEmail(email: string) {
  const [localPart] = email.split("@");
  const cleanLocalPart = localPart.replace(/[^a-zA-Z0-9]/g, "");

  if (!cleanLocalPart) {
    return null;
  }

  return cleanLocalPart.slice(0, 2).toUpperCase();
}

export function AcademyHeader() {
  const { user } = useAuth();
  const initials =
    (user?.fullName ? getInitialsFromName(user.fullName) : null) ??
    (user?.email ? getInitialsFromEmail(user.email) : null) ??
    "IG";

  return (
    <header className="app-shell-header flex flex-col gap-5 border-b border-[var(--color-border)] px-5 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div>
        <p className="text-2xl font-semibold text-white sm:text-3xl">
          Centro de control
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Gestiona tu formación y accede al programa principal.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        <LogoutButton />
        <div
          aria-label={`Iniciales del participante: ${initials}`}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card-bg)] text-sm font-semibold text-[var(--color-cyan)]"
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
