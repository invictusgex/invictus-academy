import type { NextConfig } from "next";

const supabaseHostname = (() => {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!rawUrl) {
    return null;
  }

  try {
    return new URL(rawUrl).hostname;
  } catch {
    return null;
  }
})();

const supabaseOrigin = supabaseHostname ? `https://${supabaseHostname}` : null;
const supabaseWildcardOrigin = supabaseHostname
  ? `https://*.${supabaseHostname}`
  : "https://*.supabase.co";

const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  [
    "img-src",
    "'self'",
    "data:",
    "blob:",
    supabaseOrigin,
    supabaseWildcardOrigin,
  ]
    .filter(Boolean)
    .join(" "),
  "font-src 'self' data:",
  [
    "connect-src",
    "'self'",
    supabaseOrigin,
    supabaseWildcardOrigin,
    "https://api.stripe.com",
    "https://checkout.stripe.com",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://www.youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspReportOnly,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
        source: "/(.*)",
      },
    ];
  },
};

export default nextConfig;
