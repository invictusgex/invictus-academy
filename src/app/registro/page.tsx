import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSafeInternalRedirect } from "@/lib/auth/redirects";

type RegisterPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const nextPath = getSafeInternalRedirect(params.next);

  return (
    <AuthPageShell
      description="Crea tu cuenta de estudiante para continuar con tu acceso y proceso de formación."
      eyebrow="Registro de estudiantes"
      title="Crear cuenta"
    >
      <RegisterForm nextPath={nextPath} />
    </AuthPageShell>
  );
}
