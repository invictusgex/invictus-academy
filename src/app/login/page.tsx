import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSafeInternalRedirect } from "@/lib/auth/redirects";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getSafeInternalRedirect(params.next);

  return (
    <AuthPageShell
      description="Ingresa con las credenciales asociadas a tu acceso de Invictus GEX."
      eyebrow="Acceso de estudiantes"
      title="Iniciar sesión"
    >
      <LoginForm nextPath={nextPath} />
    </AuthPageShell>
  );
}
