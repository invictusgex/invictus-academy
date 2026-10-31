export function classifyRegistrationError(error: unknown) {
  const detail = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const code = typeof detail.code === "string" ? detail.code : "";
  const message = typeof detail.message === "string" ? detail.message.toLowerCase() : "";
  if (["user_already_exists", "email_exists"].includes(code) || /already registered|already exists|user already/.test(message)) return { kind: "existing_account", status: 200, message: "" };
  if (code === "over_email_send_rate_limit" || message.includes("email rate limit")) return { kind: "email_rate_limit", status: 429, message: "El servicio de confirmación alcanzó su límite temporal de correos. Intenta registrarte más tarde; no necesitas cambiar tus datos." };
  if (code === "email_address_not_authorized") return { kind: "email_delivery_configuration", status: 503, message: "El servicio de confirmación no está habilitado para enviar a esta dirección. Contacta con soporte; no necesitas cambiar tu contraseña." };
  if (message.includes("error sending confirmation") || message.includes("error sending email")) return { kind: "confirmation_email_failed", status: 503, message: "No pudimos enviar el correo de confirmación. El servicio de correo necesita revisión. Inténtalo más tarde o contacta con soporte." };
  if (["over_request_rate_limit", "over_ip_rate_limit"].includes(code) || detail.status === 429) return { kind: "rate_limit", status: 429, message: "Se alcanzó un límite temporal de registro. Espera antes de volver a intentarlo." };
  if (code === "weak_password") return { kind: "weak_password", status: 400, message: "La contraseña no cumple los requisitos de seguridad. Usa una más larga y evita contraseñas comunes o reutilizadas." };
  if (["email_address_invalid", "validation_failed"].includes(code)) return { kind: "invalid_signup", status: 400, message: "El proveedor rechazó los datos de registro. Revisa el email y utiliza una contraseña segura." };
  if (["signup_disabled", "email_provider_disabled"].includes(code)) return { kind: "signup_unavailable", status: 503, message: "El registro por correo no está disponible en este momento. Contacta con soporte." };
  if (code === "captcha_failed") return { kind: "verification_failed", status: 400, message: "No se pudo validar la verificación de seguridad del registro. Recarga la página y contacta con soporte si continúa." };
  if (/database error saving new user/.test(message)) return { kind: "account_storage_failed", status: 503, message: "No pudimos guardar el registro por un problema del servicio. Inténtalo más tarde o contacta con soporte." };
  if (["bad_jwt", "invalid_api_key"].includes(code) || detail.status === 401 || message.includes("invalid api key") || message.startsWith("missing ")) return { kind: "auth_configuration", status: 503, message: "El servicio de registro necesita revisión de configuración. Contacta con soporte." };
  return { kind: "provider_unavailable", status: 503, message: "No pudimos confirmar el registro con el servicio de cuentas. Inténtalo más tarde. Si recibes un correo de confirmación, consérvalo." };
}
