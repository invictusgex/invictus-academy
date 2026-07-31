import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { getSafeInternalRedirect } from "@/lib/auth/redirects";
import { ProfileRepository } from "@/lib/repositories/profile.repository";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthConfirmPageProps = {
  searchParams: Promise<{
    code?: string;
    next?: string;
  }>;
};

function normalizeFullName(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim().replace(/\s+/g, " ")
    : "Estudiante Invictus";
}

export default async function AuthConfirmPage({
  searchParams,
}: AuthConfirmPageProps) {
  const params = await searchParams;
  const nextPath = getSafeInternalRedirect(params.next);
  const code = params.code;

  if (!code) {
    return (
      <AuthPageShell
        description="El enlace no incluye un codigo de confirmacion valido."
        eyebrow="Confirmacion de cuenta"
        title="No pudimos confirmar el acceso"
      >
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6">
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            Solicita un nuevo enlace o inicia el proceso nuevamente.
          </p>
          <Link
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
            href="/login"
          >
            Volver a iniciar sesion
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return (
      <AuthPageShell
        description="El enlace puede haber expirado o ya fue utilizado."
        eyebrow="Confirmacion de cuenta"
        title="No pudimos confirmar el acceso"
      >
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6">
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
            Solicita un nuevo enlace e intenta nuevamente.
          </p>
          <Link
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)]"
            href="/forgot-password"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  const { data } = await supabase.auth.getUser();

  if (data.user) {
    const adminSupabase = getSupabaseAdminClient();
    await ProfileRepository.upsertStudentProfile(adminSupabase, {
      email: data.user.email ?? "",
      fullName: normalizeFullName(data.user.user_metadata.full_name),
      profileId: data.user.id,
    });
  }

  redirect(nextPath);
}
