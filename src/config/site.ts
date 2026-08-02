const fallbackSiteUrl = "http://localhost:3000";
const fallbackSupportEmail = "invictusgex@gmail.com";

export const siteName = "Invictus GEX";

export const siteDescription =
  "Programa de Formación Profesional basado en datos, Order Flow, Heatmap, Perfil de Volumen y Exposición de Gamma.";

export function getSiteUrl() {
  const appUrl = process.env.APP_URL?.trim();

  return appUrl ? appUrl.replace(/\/+$/, "") : fallbackSiteUrl;
}

export function getSupportEmail() {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || fallbackSupportEmail;
}

export function getSupportMailtoHref(subject: string) {
  const supportEmail = getSupportEmail();

  return `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`;
}
