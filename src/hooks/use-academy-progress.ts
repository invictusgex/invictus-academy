"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import type {
  AcademyProgressState,
  Course,
  Module,
  VideoProgressStatus,
} from "@/types/academy";
import {
  getModuleProgressSummary,
  getNextPendingSession,
  getProgramProgressSummary,
} from "@/utils/module-progress";

const ACADEMY_PROGRESS_STORAGE_KEY = "invictus-academy-progress-v1";
const progressListeners = new Set<() => void>();
const emptyProgressSnapshot = createEmptyProgress();
let cachedStoredValue: string | null = null;
let cachedProgress = emptyProgressSnapshot;

type UseAcademyProgressProps = {
  academyModule?: Module;
  course?: Course;
  programId: string;
  selectedVideoId?: string;
};

function createEmptyProgress(): AcademyProgressState {
  return {
    version: 1,
    programs: {},
  };
}

function isAcademyProgressState(value: unknown): value is AcademyProgressState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AcademyProgressState>;

  return candidate.version === 1 && typeof candidate.programs === "object";
}

function readStoredProgress() {
  if (typeof window === "undefined") {
    return createEmptyProgress();
  }

  try {
    const storedValue = window.localStorage.getItem(ACADEMY_PROGRESS_STORAGE_KEY);

    if (storedValue === cachedStoredValue) {
      return cachedProgress;
    }

    if (!storedValue) {
      cachedStoredValue = storedValue;
      cachedProgress = createEmptyProgress();

      return cachedProgress;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    cachedStoredValue = storedValue;
    cachedProgress = isAcademyProgressState(parsedValue)
      ? parsedValue
      : createEmptyProgress();

    return cachedProgress;
  } catch {
    cachedStoredValue = null;
    cachedProgress = createEmptyProgress();

    return cachedProgress;
  }
}

function writeStoredProgress(progress: AcademyProgressState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const nextStoredValue = JSON.stringify(progress);

    window.localStorage.setItem(ACADEMY_PROGRESS_STORAGE_KEY, nextStoredValue);
    cachedStoredValue = nextStoredValue;
    cachedProgress = progress;
    progressListeners.forEach((listener) => listener());
  } catch {
    // El progreso local es una mejora progresiva; la interfaz debe seguir usable.
  }
}

function subscribeToProgress(listener: () => void) {
  progressListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ACADEMY_PROGRESS_STORAGE_KEY) {
      cachedStoredValue = null;
      progressListeners.forEach((currentListener) => currentListener());
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    progressListeners.delete(listener);

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function getVideoStatusFromProgress(
  progress: AcademyProgressState,
  programId: string,
  moduleId: string,
  videoId: string,
): VideoProgressStatus {
  return (
    progress.programs[programId]?.modules?.[moduleId]?.videos[videoId]?.status ??
    "not-started"
  );
}

function updateVideoStatusInProgress(
  progress: AcademyProgressState,
  programId: string,
  moduleId: string,
  videoId: string,
  status: VideoProgressStatus,
) {
  const currentStatus = getVideoStatusFromProgress(
    progress,
    programId,
    moduleId,
    videoId,
  );

  if (currentStatus === status) {
    return progress;
  }

  const nextProgress: AcademyProgressState = {
    ...progress,
    programs: {
      ...progress.programs,
      [programId]: {
        modules: {
          ...(progress.programs[programId]?.modules ?? {}),
          [moduleId]: {
            videos: {
              ...(progress.programs[programId]?.modules?.[moduleId]?.videos ??
                {}),
              [videoId]: {
                status,
                updatedAt: new Date().toISOString(),
              },
            },
          },
        },
      },
    },
  };

  return nextProgress;
}

export function useAcademyProgress({
  academyModule,
  course,
  programId,
  selectedVideoId,
}: UseAcademyProgressProps) {
  const progress = useSyncExternalStore(
    subscribeToProgress,
    readStoredProgress,
    () => emptyProgressSnapshot,
  );

  const updateVideoStatus = useCallback(
    (videoId: string, status: VideoProgressStatus) => {
      if (!academyModule) {
        return;
      }

      const currentProgress = readStoredProgress();
      const nextProgress = updateVideoStatusInProgress(
        currentProgress,
        programId,
        academyModule.id,
        videoId,
        status,
      );

      if (nextProgress !== currentProgress) {
        writeStoredProgress(nextProgress);
      }
    },
    [academyModule, programId],
  );

  useEffect(() => {
    if (!academyModule || !selectedVideoId) {
      return;
    }

    const currentStatus = getVideoStatusFromProgress(
      progress,
      programId,
      academyModule.id,
      selectedVideoId,
    );

    if (currentStatus === "not-started") {
      updateVideoStatus(selectedVideoId, "in-progress");
    }
  }, [
    academyModule,
    programId,
    progress,
    selectedVideoId,
    updateVideoStatus,
  ]);

  const getVideoStatus = useCallback(
    (moduleId: string, videoId: string) =>
      getVideoStatusFromProgress(progress, programId, moduleId, videoId),
    [programId, progress],
  );

  const getScopedVideoStatus = useCallback(
    (videoId: string) =>
      academyModule
        ? getVideoStatus(academyModule.id, videoId)
        : "not-started",
    [academyModule, getVideoStatus],
  );

  const getModuleSummary = useCallback(
    (module: Module) => getModuleProgressSummary(module, getVideoStatus),
    [getVideoStatus],
  );

  const currentModuleSummary = useMemo(
    () => (academyModule ? getModuleSummary(academyModule) : undefined),
    [academyModule, getModuleSummary],
  );
  const programSummary = useMemo(
    () => (course ? getProgramProgressSummary(course, getVideoStatus) : undefined),
    [course, getVideoStatus],
  );
  const nextPendingSession = useMemo(
    () => (course ? getNextPendingSession(course, getVideoStatus) : undefined),
    [course, getVideoStatus],
  );

  return {
    completedSessionsCount: currentModuleSummary?.completedSessions ?? 0,
    getModuleSummary,
    getScopedVideoStatus,
    getVideoStatus,
    isCurrentModuleCompleted: Boolean(currentModuleSummary?.isCompleted),
    markVideoAsCompleted: (videoId: string) =>
      updateVideoStatus(videoId, "completed"),
    nextPendingSession,
    programSummary,
  };
}
