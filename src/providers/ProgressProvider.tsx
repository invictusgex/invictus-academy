"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ProgressContext } from "@/contexts/ProgressContext";
import { useAuth } from "@/hooks/useAuth";
import {
  createEmptyAcademyProgress,
  getAcademyProgressVideoStatus,
  readAcademyProgressSnapshot,
  updateAcademyProgressVideoStatus,
  writeAcademyProgressSnapshot,
} from "@/lib/services/progress-cache.service";
import {
  moduleProgressToAcademyProgressCache,
  syncModuleProgress,
} from "@/lib/services/progress.service";
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

type ProgressProviderProps = {
  children: ReactNode;
  course: Course;
  productSlug: string;
  programId: string;
};

export function ProgressProvider({
  children,
  course,
  productSlug,
  programId,
}: ProgressProviderProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<AcademyProgressState>(() =>
    createEmptyAcademyProgress(),
  );
  const syncRequestRef = useRef(0);

  const syncFromProgress = useCallback(
    async (localProgress: AcademyProgressState) => {
      if (!user) {
        setProgress(localProgress);
        return;
      }

      const syncRequestId = syncRequestRef.current + 1;
      syncRequestRef.current = syncRequestId;
      const result = await syncModuleProgress({
        course,
        localProgress,
        productSlug,
        profileId: user.id,
        programId,
      });
      const mergedProgress = moduleProgressToAcademyProgressCache({
        course,
        moduleProgress: result.synced,
        programId,
        seedProgress: localProgress,
      });

      if (syncRequestRef.current === syncRequestId) {
        writeAcademyProgressSnapshot(mergedProgress);
        setProgress(mergedProgress);
      }
    },
    [course, productSlug, programId, user],
  );

  const refresh = useCallback(async () => {
    const localProgress = readAcademyProgressSnapshot();

    setLoading(true);

    try {
      await syncFromProgress(localProgress);
    } catch {
      setProgress(localProgress);
    } finally {
      setLoading(false);
    }
  }, [syncFromProgress]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refresh]);

  const updateVideoStatus = useCallback(
    async (
      moduleId: string,
      videoId: string,
      status: VideoProgressStatus,
    ) => {
      const currentProgress = readAcademyProgressSnapshot();
      const nextProgress = updateAcademyProgressVideoStatus(
        currentProgress,
        programId,
        moduleId,
        videoId,
        status,
      );

      if (nextProgress === currentProgress) {
        return;
      }

      writeAcademyProgressSnapshot(nextProgress);
      setProgress(nextProgress);

      try {
        await syncFromProgress(nextProgress);
      } catch {
        setProgress(readAcademyProgressSnapshot());
      }
    },
    [programId, syncFromProgress],
  );

  const getVideoStatus = useCallback(
    (moduleId: string, videoId: string) =>
      getAcademyProgressVideoStatus(progress, programId, moduleId, videoId),
    [programId, progress],
  );

  const getScopedVideoStatus = useCallback(
    (moduleId: string) => (videoId: string) =>
      getVideoStatus(moduleId, videoId),
    [getVideoStatus],
  );

  const getModuleSummary = useCallback(
    (academyModule: Module) =>
      getModuleProgressSummary(academyModule, getVideoStatus),
    [getVideoStatus],
  );

  const programSummary = useMemo(
    () => getProgramProgressSummary(course, getVideoStatus),
    [course, getVideoStatus],
  );
  const nextPendingSession = useMemo(
    () => getNextPendingSession(course, getVideoStatus),
    [course, getVideoStatus],
  );

  const value = useMemo(
    () => ({
      getModuleSummary,
      getScopedVideoStatus,
      getVideoStatus,
      loading,
      markCompleted: (moduleId: string, videoId: string) =>
        updateVideoStatus(moduleId, videoId, "completed"),
      markInProgress: (moduleId: string, videoId: string) =>
        updateVideoStatus(moduleId, videoId, "in-progress"),
      nextPendingSession,
      progress,
      programSummary,
      refresh,
    }),
    [
      getModuleSummary,
      getScopedVideoStatus,
      getVideoStatus,
      loading,
      nextPendingSession,
      progress,
      programSummary,
      refresh,
      updateVideoStatus,
    ],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}
