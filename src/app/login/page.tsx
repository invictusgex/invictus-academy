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
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[var(--color-page-bg)] px-5 py-16">
      <section className="w-full max-w-md">
        <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
          Acceso de estudiantes
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">
          Iniciar sesion
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          Ingresa con las credenciales asociadas a tu acceso de Invictus Trading
          Academy.
        </p>
        <div className="mt-8">
          <LoginForm nextPath={nextPath} />
        </div>
      </section>
    </main>
  );
}
