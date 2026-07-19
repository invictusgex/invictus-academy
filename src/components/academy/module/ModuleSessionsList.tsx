import Link from "next/link";

import type { ModuleVideo, VideoProgressStatus } from "@/types/academy";
import { formatVideoProgressStatusLabel } from "@/utils/module-progress";

type ModuleSessionsListProps = {
  getVideoStatus: (videoId: string) => VideoProgressStatus;
  moduleId: string;
  selectedVideoId?: string;
  videos: ModuleVideo[];
};

export function ModuleSessionsList({
  getVideoStatus,
  moduleId,
  selectedVideoId,
  videos,
}: ModuleSessionsListProps) {
  return (
    <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-white">Sesiones del módulo</h3>
      <div className="mt-4 grid gap-3">
        {videos.map((video, index) => {
          const sessionNumber = index + 1;
          const isSelected = video.id === selectedVideoId;
          const status = getVideoStatus(video.id);

          return (
            <Link
              aria-current={isSelected ? "true" : undefined}
              className="grid gap-3 rounded-xl border border-[var(--color-border)] px-4 py-4 text-left transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] aria-current:border-[var(--color-cyan)] aria-current:bg-[var(--color-hover-bg)] sm:grid-cols-[1fr_auto]"
              href={`/academy/programa/${moduleId}?video=${sessionNumber}`}
              key={video.id}
            >
              <span>
                <span className="block text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                  Sesión {sessionNumber}
                </span>
                <span className="mt-1 block break-words text-sm font-semibold leading-6 text-white">
                  {video.title}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-2 sm:justify-end">
                {isSelected ? (
                  <span className="rounded-full border border-[var(--color-cyan)] px-3 py-1 text-xs font-semibold text-[var(--color-cyan)]">
                    Actual
                  </span>
                ) : null}
                <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                  {formatVideoProgressStatusLabel(status)}
                </span>
                <span className="text-sm font-semibold text-[var(--color-cyan)]">
                  Abrir sesión
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
