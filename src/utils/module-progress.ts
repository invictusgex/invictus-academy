import type {
  Course,
  Module,
  ModuleVideo,
  VideoProgressStatus,
} from "@/types/academy";

export type CompletedModuleVideos = Record<string, boolean>;

export function isModuleCompleted(
  academyModule: Module,
  completedVideos: CompletedModuleVideos,
) {
  return (
    academyModule.videos.length > 0 &&
    academyModule.videos.every((video) => completedVideos[video.id])
  );
}

export function formatVideoProgressStatusLabel(status: VideoProgressStatus) {
  if (status === "completed") {
    return "Completada";
  }

  if (status === "in-progress") {
    return "En progreso";
  }

  return "No iniciada";
}

export function getProgressPercentage(completedItems: number, totalItems: number) {
  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

export type ModuleProgressStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export function getModuleProgressSummary(
  academyModule: Module,
  getVideoStatus: (moduleId: string, videoId: string) => VideoProgressStatus,
) {
  const totalSessions = academyModule.videos.length;
  const completedSessions = academyModule.videos.filter(
    (video) => getVideoStatus(academyModule.id, video.id) === "completed",
  ).length;
  const startedSessions = academyModule.videos.filter((video) => {
    const status = getVideoStatus(academyModule.id, video.id);

    return status === "in-progress" || status === "completed";
  }).length;
  const percentage = getProgressPercentage(completedSessions, totalSessions);
  const completedVideos = Object.fromEntries(
    academyModule.videos.map((video) => [
      video.id,
      getVideoStatus(academyModule.id, video.id) === "completed",
    ]),
  );
  const isCompleted = isModuleCompleted(academyModule, completedVideos);
  const status: ModuleProgressStatus =
    isCompleted
      ? "completed"
      : startedSessions > 0
        ? "in-progress"
        : "not-started";

  return {
    completedSessions,
    isCompleted,
    percentage,
    pendingSessions: Math.max(totalSessions - completedSessions, 0),
    status,
    totalSessions,
  };
}

export function getProgramProgressSummary(
  course: Course,
  getVideoStatus: (moduleId: string, videoId: string) => VideoProgressStatus,
) {
  const totalSessions = course.modules.reduce(
    (total, academyModule) => total + academyModule.videos.length,
    0,
  );
  const completedSessions = course.modules.reduce(
    (total, academyModule) =>
      total +
      academyModule.videos.filter(
        (video) => getVideoStatus(academyModule.id, video.id) === "completed",
      ).length,
    0,
  );

  return {
    completedSessions,
    moduleCount: course.modules.length,
    pendingSessions: Math.max(totalSessions - completedSessions, 0),
    percentage: getProgressPercentage(completedSessions, totalSessions),
    totalSessions,
  };
}

export type NextPendingSession = {
  href: string;
  module: Module;
  sessionNumber: number;
  video: ModuleVideo;
};

export function getNextPendingSession(
  course: Course,
  getVideoStatus: (moduleId: string, videoId: string) => VideoProgressStatus,
): NextPendingSession | undefined {
  for (const academyModule of course.modules) {
    const pendingVideoIndex = academyModule.videos.findIndex(
      (video) => getVideoStatus(academyModule.id, video.id) !== "completed",
    );

    if (pendingVideoIndex >= 0) {
      const sessionNumber = pendingVideoIndex + 1;

      return {
        href: `/academy/programa/${academyModule.id}${
          sessionNumber > 1 ? `?video=${sessionNumber}` : ""
        }`,
        module: academyModule,
        sessionNumber,
        video: academyModule.videos[pendingVideoIndex],
      };
    }
  }

  return undefined;
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
