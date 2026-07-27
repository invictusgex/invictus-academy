import type { Course, Module, VideoProgressStatus } from "@/types/academy";

export function getProgressPercentage(completedItems: number, totalItems: number) {
  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

export type ModuleProgressStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export type ProgramProgressStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED";

export type ProgramModuleProgress = ReturnType<typeof getModuleProgressSummary> & {
  academyModule: Module;
  href: string;
  statusLabel: string;
};

export type ProgramProgress = {
  completedModules: number;
  currentModule: ProgramModuleProgress | null;
  inProgressModules: number;
  modules: ProgramModuleProgress[];
  modulesById: Record<string, ProgramModuleProgress>;
  nextModule: ProgramModuleProgress | null;
  percentage: number;
  status: ProgramProgressStatus;
  statusLabel: string;
  totalModules: number;
};

export function getProgressEligibleModules(modules: Module[]) {
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

export function getModuleProgressSummary(
  academyModule: Module,
  getVideoStatus: (moduleId: string, videoId: string) => VideoProgressStatus,
) {
  const totalVideos = academyModule.videos.length;
  const completedVideos = academyModule.videos.filter(
    (video) => getVideoStatus(academyModule.id, video.id) === "completed",
  ).length;
  const startedVideos = academyModule.videos.filter((video) => {
    const status = getVideoStatus(academyModule.id, video.id);

    return status === "in-progress" || status === "completed";
  }).length;
  const percentage = getProgressPercentage(completedVideos, totalVideos);
  const completedVideoMap = Object.fromEntries(
    academyModule.videos.map((video) => [
      video.id,
      getVideoStatus(academyModule.id, video.id) === "completed",
    ]),
  );
  const isCompleted =
    academyModule.videos.length > 0 &&
    academyModule.videos.every((video) => completedVideoMap[video.id]);
  const status: ModuleProgressStatus =
    isCompleted
      ? "completed"
      : startedVideos > 0
        ? "in-progress"
        : "not-started";

  return {
    completedVideos,
    isCompleted,
    percentage,
    pendingVideos: Math.max(totalVideos - completedVideos, 0),
    status,
    totalVideos,
  };
}

function getProgramProgressStatus({
  completedModules,
  inProgressModules,
  totalModules,
}: {
  completedModules: number;
  inProgressModules: number;
  totalModules: number;
}): ProgramProgressStatus {
  if (totalModules > 0 && completedModules >= totalModules) {
    return "COMPLETED";
  }

  if (completedModules > 0 || inProgressModules > 0) {
    return "IN_PROGRESS";
  }

  return "NOT_STARTED";
}

export function formatProgramProgressStatusLabel(
  status: ProgramProgressStatus,
) {
  if (status === "COMPLETED") {
    return "Programa completado";
  }

  if (status === "IN_PROGRESS") {
    return "Formacion en progreso";
  }

  return "Formacion no iniciada";
}

export function getProgramProgress(
  course: Course,
  getVideoStatus: (moduleId: string, videoId: string) => VideoProgressStatus,
) {
  const modules = getProgressEligibleModules(course.modules).map(
    (academyModule) => {
      const summary = getModuleProgressSummary(academyModule, getVideoStatus);

      return {
        ...summary,
        academyModule,
        href: `/academy/programa/${academyModule.id}`,
        statusLabel: formatModuleProgressStatusLabel(summary.status),
      };
    },
  );
  const totalModules = modules.length;
  const completedModules = modules.filter(
    (moduleProgress) => moduleProgress.status === "completed",
  ).length;
  const inProgressModules = modules.filter(
    (moduleProgress) => moduleProgress.status === "in-progress",
  ).length;
  const currentModule =
    modules.find((moduleProgress) => moduleProgress.status === "in-progress") ??
    modules.find((moduleProgress) => moduleProgress.status !== "completed") ??
    null;
  const currentModuleIndex = currentModule
    ? modules.findIndex(
        (moduleProgress) =>
          moduleProgress.academyModule.id === currentModule.academyModule.id,
      )
    : -1;
  const nextModule =
    currentModuleIndex >= 0 && currentModuleIndex < modules.length - 1
      ? modules[currentModuleIndex + 1]
      : null;
  const status = getProgramProgressStatus({
    completedModules,
    inProgressModules,
    totalModules,
  });

  return {
    completedModules,
    currentModule,
    inProgressModules,
    modules,
    modulesById: Object.fromEntries(
      modules.map((moduleProgress) => [
        moduleProgress.academyModule.id,
        moduleProgress,
      ]),
    ),
    nextModule,
    percentage: getProgressPercentage(completedModules, totalModules),
    status,
    statusLabel: formatProgramProgressStatusLabel(status),
    totalModules,
  };
}

export function formatModuleProgressStatusLabel(
  status: ModuleProgressStatus,
) {
  if (status === "completed") {
    return "Completado";
  }

  if (status === "in-progress") {
    return "En progreso";
  }

  return "No iniciado";
}
