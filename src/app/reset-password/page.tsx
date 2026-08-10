import { cookies } from "next/headers";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import {
  passwordRecoveryCookieName,
  passwordRecoveryCookieValue,
} from "@/lib/auth/password-recovery";

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const recoveryVerified =
    cookieStore.get(passwordRecoveryCookieName)?.value ===
    passwordRecoveryCookieValue;

  return (
    <AuthPageShell
      description="Define una nueva contraseña para recuperar el acceso a tu cuenta."
      eyebrow="Nueva contraseña"
      title="Crear nueva contraseña"
    >
      <ResetPasswordForm recoveryVerified={recoveryVerified} />
    </AuthPageShell>
  );
}
