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
    ],
    name: siteName,
    short_name: "Invictus Academy",
    start_url: "/",
    theme_color: "#030712",
  };
}
