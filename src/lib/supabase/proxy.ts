import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  checkRateLimit,
  getRateLimitIdentity,
} from "@/lib/security/rate-limit";
import {
  getSupabasePublicConfig,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

function getProxyRateLimit(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname === "/api/stripe/webhook" ||
    pathname.startsWith("/api/auth/")
  ) {
    return null;
  }

  const identity = getRateLimitIdentity(request);

  if (pathname.startsWith("/api/")) {
    return {
      key: `proxy:api:${identity}`,
      limit: 120,
      windowMs: 60_000,
    };
  }

  return {
    key: `proxy:page:${identity}`,
    limit: 240,
    windowMs: 60_000,
  };
}

function createProxyRateLimitResponse(
  request: NextRequest,
  retryAfterSeconds: number,
) {
  const headers = {
    "Cache-Control": "no-store",
    "Retry-After": String(retryAfterSeconds),
  };

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Demasiadas solicitudes. Intenta nuevamente en unos segundos.",
        },
      },
      {
        headers,
        status: 429,
      },
    );
  }

  return new NextResponse(
    "Demasiadas solicitudes. Intenta nuevamente en unos segundos.",
    {
      headers,
      status: 429,
    },
  );
}

export async function updateSupabaseSession(request: NextRequest) {
  const rateLimitConfig = getProxyRateLimit(request);

  if (rateLimitConfig) {
    const rateLimit = checkRateLimit(rateLimitConfig);

    if (!rateLimit.allowed) {
      return createProxyRateLimitResponse(
        request,
        rateLimit.retryAfterSeconds,
      );
    }
  }

  let response = NextResponse.next({
    request,
  });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const config = getSupabasePublicConfig();
  const supabase = createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}
