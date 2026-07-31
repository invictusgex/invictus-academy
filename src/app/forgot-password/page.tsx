import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getSafeInternalRedirect } from "@/lib/auth/redirects";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const nextPath = getSafeInternalRedirect(params.next);

  return (
    <AuthPageShell
      description="Solicita un enlace seguro para recuperar el acceso a tu cuenta."
      eyebrow="Recuperacion de acceso"
      title="Recuperar contrasena"
    >
      <ForgotPasswordForm nextPath={nextPath} />
    </AuthPageShell>
  );
}
