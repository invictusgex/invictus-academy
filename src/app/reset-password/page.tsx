import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      description="Define una nueva contraseña para recuperar el acceso a tu cuenta."
      eyebrow="Nueva contraseña"
      title="Crear nueva contraseña"
    >
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
