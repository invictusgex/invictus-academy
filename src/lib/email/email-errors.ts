export type EmailFailureCode = "configuration" | "authentication" | "sender_domain" | "test_recipient" | "permission" | "quota" | "rate_limit" | "invalid_request" | "provider_unavailable" | "timeout" | "network" | "unknown";

export class EmailDeliveryError extends Error {
  constructor(public readonly code: EmailFailureCode, public readonly httpStatus: number | null = null) {
    super(`EMAIL_DELIVERY_${code.toUpperCase()}`);
    this.name = "EmailDeliveryError";
  }
}

// Provider text is inspected only to choose an allowlisted code; never return or log it.
export function classifyEmailRejection(status: number, body: unknown): EmailFailureCode {
  const detail = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const name = typeof detail.name === "string" ? detail.name.toLowerCase() : "";
  const message = typeof detail.message === "string" ? detail.message.toLowerCase() : "";
  if (status === 401 || ["missing_api_key", "restricted_api_key", "suspended_api_key"].includes(name) || /api key.*invalid|invalid.*api key/.test(message)) return "authentication";
  if (status === 403 && message.includes("testing emails")) return "test_recipient";
  if (status === 403 && message.includes("domain") && message.includes("not verified")) return "sender_domain";
  if (["daily_quota_exceeded", "monthly_quota_exceeded", "email_above_quota"].includes(name)) return "quota";
  if (status === 429) return "rate_limit";
  if (status === 403) return "permission";
  if (status >= 500) return "provider_unavailable";
  if (status >= 400 && status < 500) return "invalid_request";
  return "unknown";
}

export function emailFailureCode(error: unknown): EmailFailureCode {
  return error instanceof EmailDeliveryError ? error.code : "unknown";
}

export const emailFailureMessages: Record<EmailFailureCode, string> = {
  configuration: "Falta configurar el destinatario o el proveedor de correo en Hostinger.",
  authentication: "Resend rechazó la clave de correo. Revisa RESEND_API_KEY en Hostinger; no la compartas aquí.",
  sender_domain: "El dominio del remitente no está verificado en Resend. Verifica ese dominio y usa una dirección de ese dominio en EMAIL_FROM.",
  test_recipient: "Resend limita este remitente de prueba al correo de su propia cuenta. Verifica un dominio y configura EMAIL_FROM con ese dominio.",
  permission: "Resend denegó el envío. Revisa los permisos de la clave y el remitente EMAIL_FROM.",
  quota: "Se agotó la cuota de correo de Resend. Revisa el uso de la cuenta antes de volver a probar.",
  rate_limit: "Resend recibió demasiadas solicitudes. Espera un momento antes de reintentar.",
  invalid_request: "Resend rechazó los datos del correo. Revisa el formato de EMAIL_FROM, EMAIL_REPLY_TO y LIVE_ROOM_ALERT_EMAIL.",
  provider_unavailable: "Resend no está disponible temporalmente. Intenta de nuevo más tarde.",
  timeout: "El proveedor de correo no respondió dentro del tiempo límite. Intenta de nuevo más tarde.",
  network: "El servidor no pudo conectarse con Resend. Revisa la conexión saliente de Hostinger.",
  unknown: "No se pudo confirmar el envío. Revisa la configuración y los registros del servidor.",
};
