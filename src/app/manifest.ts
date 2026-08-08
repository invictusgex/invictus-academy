import type { MetadataRoute } from "next";

import { siteDescription, siteName } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#030712",
    description: siteDescription,
    display: "standalone",
    icons: [
      {
        sizes: "any",
        src: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        sizes: "192x192",
        src: "/brand/invictus-gex-icon-192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/brand/invictus-gex-icon-512.png",
        type: "image/png",
      },
    ],
    name: siteName,
    short_name: "Invictus GEX",
    start_url: "/",
    theme_color: "#030712",
  };
}
