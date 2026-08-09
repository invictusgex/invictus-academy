import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getSafeInternalRedirect } from "@/lib/auth/redirects";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const nextPath = getSafeInternalRedirect(params.next);

  return (
    <AuthPageShell
      description="Define una nueva contraseña para recuperar el acceso a tu cuenta."
      eyebrow="Nueva contraseña"
      title="Crear nueva contraseña"
    >
      <ResetPasswordForm nextPath={nextPath} />
    </AuthPageShell>
  );
}
