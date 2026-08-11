import "server-only";

import { getEmailConfig } from "@/lib/email/email-config";

type SendTransactionalEmailInput = {
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

  if (!config || !config.welcomeEnabled) {
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

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Transactional email provider rejected the message.");
  }

  return { sent: true, reason: null };
}

export const TransactionalEmailService = {
  send(input: SendTransactionalEmailInput) {
    return sendWithResend(input);
  },
};
