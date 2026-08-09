const developmentSiteUrl = "http://localhost:3000";
const productionSiteUrl = "https://invictusgex.com";
const fallbackSupportEmail = "invictusgex@gmail.com";

export const siteName = "Invictus GEX";

export const siteDescription =
  "Programa de Formación Profesional para desarrollar criterio de lectura de mercado, con formación estructurada y mentoría privada en vivo 1 a 1.";

export function getSiteUrl() {
  const appUrl =
    process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (appUrl) {
    const normalizedUrl = appUrl.replace(/\/+$/, "");

    if (process.env.NODE_ENV === "production") {
      try {
        const hostname = new URL(normalizedUrl).hostname;

        if (hostname === "localhost" || hostname === "127.0.0.1") {
          return productionSiteUrl;
        }
      } catch {
        return productionSiteUrl;
      }
    }

    return normalizedUrl;
  }

  return process.env.NODE_ENV === "production"
    ? productionSiteUrl
    : developmentSiteUrl;
}

export function getSupportEmail() {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || fallbackSupportEmail;
}

export function getSupportMailtoHref(subject: string) {
  const supportEmail = getSupportEmail();

  return `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`;
}
