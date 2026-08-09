import { NextResponse } from "next/server";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult =
  | {
      allowed: true;
      remaining: number;
      resetAt: number;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
      resetAt: number;
    };

const buckets = new Map<string, RateLimitBucket>();

function cleanupExpiredBuckets(now: number) {
  if (buckets.size < 500) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function getForwardedIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    null
  );
}

export function getRateLimitIdentity(request: Request, userId?: string | null) {
  const ip = getForwardedIp(request) ?? "unknown-ip";

  return userId ? `user:${userId}:ip:${ip}` : `ip:${ip}`;
}

export function checkRateLimit(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const current = buckets.get(input.key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + input.windowMs;

    buckets.set(input.key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: input.limit - 1,
      resetAt,
    };
  }

  if (current.count >= input.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  buckets.set(input.key, current);

  return {
    allowed: true,
    remaining: input.limit - current.count,
    resetAt: current.resetAt,
  };
}

export function createRateLimitResponse(message: string, retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: {
        code: "RATE_LIMITED",
        message,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds),
      },
      status: 429,
    },
  );
}

export function createSimpleRateLimitResponse(
  message: string,
  retryAfterSeconds: number,
) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds),
      },
      status: 429,
    },
  );
}
