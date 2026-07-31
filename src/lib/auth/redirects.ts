const defaultAuthenticatedPath = "/academy";
const defaultPublicPath = "/";

function startsWithSingleSlash(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}

export function getSafeInternalRedirect(
  value: string | null | undefined,
  fallback = defaultAuthenticatedPath,
) {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();

  if (!startsWithSingleSlash(trimmed)) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "http://internal.local");

    if (parsed.origin !== "http://internal.local") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function getSafePublicRedirect(value: string | null | undefined) {
  return getSafeInternalRedirect(value, defaultPublicPath);
}
