const fallbackSiteUrl = "http://localhost:3000";

export const siteName = "Invictus Trading Academy";

export const siteDescription =
  "Plataforma educativa de trading basada en datos, Order Flow, Heatmap, Perfil de Volumen y Exposicion de Gamma.";

export function getSiteUrl() {
  const appUrl = process.env.APP_URL?.trim();

  return appUrl ? appUrl.replace(/\/+$/, "") : fallbackSiteUrl;
}
