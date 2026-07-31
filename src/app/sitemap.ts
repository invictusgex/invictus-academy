import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/config/site";

const publicRoutes = [
  {
    changeFrequency: "weekly",
    path: "/",
    priority: 1,
  },
  {
    changeFrequency: "weekly",
    path: "/programa",
    priority: 0.9,
  },
  {
    changeFrequency: "weekly",
    path: "/oferta",
    priority: 0.8,
  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return publicRoutes.map((route) => ({
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    url: `${siteUrl}${route.path}`,
  }));
}
