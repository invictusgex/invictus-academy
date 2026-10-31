import "server-only";

import { getEmailConfig } from "@/lib/email/email-config";
import { classifyEmailRejection, EmailDeliveryError } from "@/lib/email/email-errors";

type SendTransactionalEmailInput = {
  category?: "welcome" | "operational";
  idempotencyKey?: string;
  html: string;
  subject: string;
  text: string;
  to: string;
};

type ResendEmailPayload = {
  from: string;
  html: string;
  reply_to?: string;
  subject: string;
  text: string;
  to: string[];
};

async function sendWithResend(input: SendTransactionalEmailInput) {
  const config = getEmailConfig();

  if (!config || (input.category !== "operational" && !config.welcomeEnabled)) {
    return { sent: false, reason: "email_not_configured" as const };
  }

  const payload: ResendEmailPayload = {
    from: config.from,
    html: input.html,
    subject: input.subject,
    text: input.text,
    to: [input.to],
  };

  if (config.replyTo) {
    payload.reply_to = config.replyTo;
  }

  let response: Response;
  try { response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
      ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
    },
    method: "POST",
    signal: input.category === "operational" ? AbortSignal.timeout(8_000) : undefined,
  }); } catch (error) {
    const name = error instanceof Error ? error.name : "";
    throw new EmailDeliveryError(["TimeoutError", "AbortError"].includes(name) ? "timeout" : "network");
  }

  if (!response.ok) {
    let body: unknown = null;
    try { body = await response.json(); } catch { /* Keep diagnostics safe even for non-JSON provider failures. */ }
    throw new EmailDeliveryError(classifyEmailRejection(response.status, body), response.status);
  }

  return { sent: true, reason: null };
}

export const TransactionalEmailService = {
  send(input: SendTransactionalEmailInput) {
    return sendWithResend(input);
  },
};
