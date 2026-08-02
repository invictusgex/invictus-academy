import type { ModuleProgressStatus } from "@/utils/module-progress";

export function getStudentNameFromEmail(email: string | null | undefined) {
  if (!email) {
    return "Trader";
  }

  const [localPart] = email.split("@");
  const readableName = localPart
    ?.replace(/[._-]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");

  return readableName || "Trader";
}

export function getStudentGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Buenos días";
  }

  if (hour >= 12 && hour < 19) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

export function getModuleStatusTone(status: ModuleProgressStatus) {
  if (status === "completed") {
    return "complete" as const;
  }

  if (status === "in-progress") {
    return "progress" as const;
  }

  return "neutral" as const;
}

export function getExternalThumbnailUrl(thumbnailUrl: string | null | undefined) {
  if (!thumbnailUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(thumbnailUrl);

    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return thumbnailUrl;
    }
  } catch {
    return null;
  }

  return null;
}
