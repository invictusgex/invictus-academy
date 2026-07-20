"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ModuleSessionsList } from "@/components/academy/module/ModuleSessionsList";
import { SessionCompletionPanel } from "@/components/academy/module/SessionCompletionPanel";
import { SessionProgress } from "@/components/academy/module/SessionProgress";
import { useProgressContext } from "@/contexts/ProgressContext";
import type { Module } from "@/types/academy";

type TrainingSessionProps = {
  academyModule: Module;
  isAvailable: boolean;
  selectedVideoId?: string;
};

export function TrainingSession({
  academyModule,
  isAvailable,
  selectedVideoId,
}: TrainingSessionProps) {
  const videos = academyModule.videos;
  const selectedVideoIndex = Math.max(
    videos.findIndex((video) => video.id === selectedVideoId),
    0,
  );
  const selectedVideo = videos[selectedVideoIndex];
  const hasMultipleVideos = videos.length > 1;
  const previousVideoNumber =
    selectedVideoIndex > 0 ? selectedVideoIndex : undefined;
  const nextVideoNumber =
    selectedVideoIndex < videos.length - 1 ? selectedVideoIndex + 2 : undefined;
  const hasAvailableVideo =
    isAvailable && Boolean(selectedVideo?.placeholder.trim());
  const {
    getModuleSummary,
    getScopedVideoStatus,
    markCompleted,
    markInProgress,
  } = useProgressContext();
  const moduleSummary = getModuleSummary(academyModule);
  const getCurrentModuleVideoStatus = getScopedVideoStatus(academyModule.id);
  const selectedVideoStatus = selectedVideo
    ? getCurrentModuleVideoStatus(selectedVideo.id)
    : "not-started";
  const isSelectedVideoCompleted = selectedVideoStatus === "completed";

  useEffect(() => {
    if (!selectedVideo || selectedVideoStatus !== "not-started") {
      return;
    }

    void markInProgress(academyModule.id, selectedVideo.id);
  }, [academyModule.id, markInProgress, selectedVideo, selectedVideoStatus]);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Contenido principal del módulo
      </p>
      <h2 className="mt-3 text-xl font-semibold text-white">
        Sesión de formación
      </h2>
      {hasMultipleVideos ? (
        <>
          <SessionProgress
            completedSessions={moduleSummary.completedSessions}
            totalSessions={videos.length}
          />
          <ModuleSessionsList
            getVideoStatus={getCurrentModuleVideoStatus}
            moduleId={academyModule.id}
            selectedVideoId={selectedVideo?.id}
            videos={videos}
          />
        </>
      ) : null}
      <div className="mt-6 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 text-center">
        <p className="max-w-lg break-words text-base font-semibold leading-7 text-white sm:text-lg">
          {hasAvailableVideo
            ? selectedVideo?.placeholder
            : "La sesión de formación aún no está disponible."}
        </p>
      </div>
      {selectedVideo ? (
        <button
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-center text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
          onClick={() => markCompleted(academyModule.id, selectedVideo.id)}
          type="button"
        >
          {isSelectedVideoCompleted
            ? "Sesión completada"
            : "Marcar sesión como completada"}
        </button>
      ) : null}
      {isSelectedVideoCompleted ? (
        <SessionCompletionPanel
          isModuleCompleted={moduleSummary.isCompleted}
          moduleId={academyModule.id}
          nextVideo={nextVideoNumber ? videos[nextVideoNumber - 1] : undefined}
          nextVideoNumber={nextVideoNumber}
          selectedSessionNumber={selectedVideoIndex + 1}
        />
      ) : null}
      {hasMultipleVideos ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {previousVideoNumber ? (
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-center text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
                href={`/academy/programa/${academyModule.id}?video=${previousVideoNumber}`}
              >
                Sesión anterior
              </Link>
            ) : null}
          </div>
          {nextVideoNumber ? (
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-center text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
              href={`/academy/programa/${academyModule.id}?video=${nextVideoNumber}`}
            >
              Siguiente sesión
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
