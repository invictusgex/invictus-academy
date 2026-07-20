"use client";

import { createContext, useContext } from "react";

import type {
  AcademyProgressState,
  Module,
  VideoProgressStatus,
} from "@/types/academy";
import type {
  getModuleProgressSummary,
  getProgramProgressSummary,
  NextPendingSession,
} from "@/utils/module-progress";

export type ProgressContextValue = {
  getModuleSummary: (
    academyModule: Module,
  ) => ReturnType<typeof getModuleProgressSummary>;
  getScopedVideoStatus: (moduleId: string) => (videoId: string) => VideoProgressStatus;
  getVideoStatus: (moduleId: string, videoId: string) => VideoProgressStatus;
  loading: boolean;
  markCompleted: (moduleId: string, videoId: string) => Promise<void>;
  markInProgress: (moduleId: string, videoId: string) => Promise<void>;
  nextPendingSession: NextPendingSession | undefined;
  progress: AcademyProgressState;
  programSummary: ReturnType<typeof getProgramProgressSummary>;
  refresh: () => Promise<void>;
};

export const ProgressContext = createContext<ProgressContextValue | undefined>(
  undefined,
);

export function useProgressContext() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("useProgressContext must be used within ProgressProvider.");
  }

  return context;
}
