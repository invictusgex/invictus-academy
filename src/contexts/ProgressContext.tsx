"use client";

import { createContext, useContext } from "react";

import type { VideoProgressStatus } from "@/types/academy";
import type { ProgramProgress } from "@/utils/module-progress";

export type ProgressContextValue = {
  getScopedVideoStatus: (
    moduleId: string,
  ) => (videoId: string) => VideoProgressStatus;
  getVideoStatus: (moduleId: string, videoId: string) => VideoProgressStatus;
  loading: boolean;
  markCompleted: (moduleId: string, videoId: string) => Promise<void>;
  markInProgress: (moduleId: string, videoId: string) => Promise<void>;
  progress: ProgramProgress;
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
