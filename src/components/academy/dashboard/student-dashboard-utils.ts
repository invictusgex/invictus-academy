import type { Module } from "@/types/academy";
import type {
  ModuleProgressStatus as PersistedModuleProgressStatus,
} from "@/lib/types/progress.types";
import type { ModuleProgressStatus } from "@/utils/module-progress";

export type StudentModuleSummary = {
  academyModule: Module;
  status: ModuleProgressStatus;
  statusLabel: string;
};

export function getAccessibleModules(modules: Module[]) {
  return modules
    .filter(
      (academyModule) =>
        academyModule.availability === "available" &&
        academyModule.status !== "archived" &&
        academyModule.status !== "draft",
    )
    .sort(
      (firstModule, secondModule) =>
        firstModule.number - secondModule.number ||
        firstModule.id.localeCompare(secondModule.id),
    );
}

export function getCurrentModuleSummary(moduleSummaries: StudentModuleSummary[]) {
  return (
    moduleSummaries.find(
      (moduleSummary) => moduleSummary.status === "in-progress",
    ) ??
    moduleSummaries.find(
      (moduleSummary) => moduleSummary.status !== "completed",
    ) ??
    null
  );
}

export function toStudentModuleStatus(
  status: PersistedModuleProgressStatus,
): ModuleProgressStatus {
  if (status === "completed") {
    return "completed";
  }

  if (status === "in_progress") {
    return "in-progress";
  }

  return "not-started";
}

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
    return "Buenos dias";
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

export function getProgramStatusLabel({
  completedModules,
  totalModules,
}: {
  completedModules: number;
  totalModules: number;
}) {
  if (totalModules === 0 || completedModules === 0) {
    return "Formacion no iniciada";
  }

  if (completedModules >= totalModules) {
    return "Programa completado";
  }

  return "Formacion en progreso";
}

export function getProgressPercentage(completedModules: number, totalModules: number) {
  if (totalModules <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((completedModules / totalModules) * 100));
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
