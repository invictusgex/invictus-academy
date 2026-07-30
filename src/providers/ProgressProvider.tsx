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
  writeAcademyProgressSnapshot,
} from "@/lib/services/progress-cache.service";
import {
  fetchModuleProgress,
  markModuleCompleted,
  moduleProgressToAcademyProgressCache,
} from "@/lib/services/progress.service";
import type {
  AcademyProgressState,
  Course,
} from "@/types/academy";
import { getProgramProgress } from "@/utils/module-progress";

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
  const [storedProgress, setStoredProgress] = useState<AcademyProgressState>(() =>
    createEmptyAcademyProgress(),
  );
  const syncRequestRef = useRef(0);

  const loadRemoteProgress = useCallback(
    async () => {
      if (!user) {
        const emptyProgress = createEmptyAcademyProgress();

        writeAcademyProgressSnapshot(emptyProgress);
        setStoredProgress(emptyProgress);
        return;
      }

      const syncRequestId = syncRequestRef.current + 1;
      syncRequestRef.current = syncRequestId;
      const moduleProgress = await fetchModuleProgress({
        productSlug,
      });
      const remoteProgress = moduleProgressToAcademyProgressCache({
        course,
        moduleProgress,
        programId,
        seedProgress: createEmptyAcademyProgress(),
      });

      if (syncRequestRef.current === syncRequestId) {
        writeAcademyProgressSnapshot(remoteProgress);
        setStoredProgress(remoteProgress);
      }
    },
    [course, productSlug, programId, user],
  );

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      await loadRemoteProgress();
    } catch {
      const emptyProgress = createEmptyAcademyProgress();

      writeAcademyProgressSnapshot(emptyProgress);
      setStoredProgress(emptyProgress);
    } finally {
      setLoading(false);
    }
  }, [loadRemoteProgress]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [refresh]);

  const updateModuleCompletion = useCallback(
    async (moduleId: string) => {
      await markModuleCompleted({
        moduleKey: moduleId,
        productSlug,
      });
      await refresh();
    },
    [productSlug, refresh],
  );

  const getVideoStatus = useCallback(
    (moduleId: string, videoId: string) =>
      getAcademyProgressVideoStatus(storedProgress, programId, moduleId, videoId),
    [programId, storedProgress],
  );

  const getScopedVideoStatus = useCallback(
    (moduleId: string) => (videoId: string) =>
      getVideoStatus(moduleId, videoId),
    [getVideoStatus],
  );

  const progress = useMemo(
    () => getProgramProgress(course, getVideoStatus),
    [course, getVideoStatus],
  );

  const value = useMemo(
    () => ({
      getScopedVideoStatus,
      getVideoStatus,
      loading,
      markCompleted: async (moduleId: string) => {
        await updateModuleCompletion(moduleId);
      },
      markInProgress: async () => {},
      markModuleCompleted: updateModuleCompletion,
      progress,
      refresh,
    }),
    [
      getScopedVideoStatus,
      getVideoStatus,
      loading,
      progress,
      refresh,
      updateModuleCompletion,
    ],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}
