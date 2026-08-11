import "server-only";

export type EmailProvider = "resend";

export type EmailConfig = {
  from: string;
  provider: EmailProvider;
  replyTo: string | null;
  resendApiKey: string;
  welcomeEnabled: boolean;
};

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();

  return value || null;
}

function getEmailProvider(value: string | null): EmailProvider | null {
  if (value === "resend") {
    return value;
  }

  return null;
}

export function getEmailConfig(): EmailConfig | null {
  const provider = getEmailProvider(readOptionalEnv("EMAIL_PROVIDER"));
  const from = readOptionalEnv("EMAIL_FROM");
  const resendApiKey = readOptionalEnv("RESEND_API_KEY");

  if (!provider || !from || !resendApiKey) {
    return null;
  }

  return {
    from,
    provider,
    replyTo: readOptionalEnv("EMAIL_REPLY_TO"),
    resendApiKey,
    welcomeEnabled: readOptionalEnv("EMAIL_WELCOME_ENABLED") !== "false",
  };
}
