const developmentSiteUrl = "http://localhost:3000";
const productionSiteUrl = "https://invictusgex.com";
const fallbackSupportEmail = "invictusgex@gmail.com";

export const siteName = "Invictus GEX";

export const siteDescription =
  "Mentoría privada Invictus GEX: sesiones individuales en vivo hasta completar la mentoría. Pago único de 349 USD, sin vídeos grabados ni descuentos.";

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
