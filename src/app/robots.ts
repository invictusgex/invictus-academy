import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      allow: ["/", "/programa", "/oferta"],
      disallow: [
        "/admin",
        "/academy",
        "/api",
        "/auth",
        "/checkout",
        "/forgot-password",
        "/login",
        "/registro",
        "/reset-password",
      ],
      userAgent: "*",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
