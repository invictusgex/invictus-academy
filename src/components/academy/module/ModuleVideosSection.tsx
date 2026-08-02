import {
  StudentCard,
  StudentEmptyState,
  StudentSection,
  StudentStatusBadge,
} from "@/components/student";
import type { ModuleVideo } from "@/types/academy";
import type { ModuleProgressStatus } from "@/utils/module-progress";
import { classNames } from "@/utils/class-names";

type ModuleVideosSectionProps = {
  moduleStatus: ModuleProgressStatus;
  videos: ModuleVideo[];
};

type VideoEmbedConfig = {
  provider: "youtube";
  src: string;
};

function getYoutubeEmbedConfig(video: ModuleVideo): VideoEmbedConfig | null {
  const provider = video.provider?.toLowerCase().trim();
  const providerVideoId = video.providerVideoId?.trim();

  if (provider !== "youtube" || !providerVideoId) {
    return null;
  }

  if (!/^[a-zA-Z0-9_-]{11}$/.test(providerVideoId)) {
    return null;
  }

  const params = new URLSearchParams({
    iv_load_policy: "3",
    playsinline: "1",
    rel: "0",
  });

  return {
    provider: "youtube",
    src: `https://www.youtube-nocookie.com/embed/${providerVideoId}?${params.toString()}`,
  };
}

function getVideoEmbedConfig(video: ModuleVideo): VideoEmbedConfig | null {
  const provider = video.provider?.toLowerCase().trim();

  switch (provider) {
    case "youtube":
      return getYoutubeEmbedConfig(video);
    case "vimeo":
    case "cloudflare":
    case "cloudflare stream":
    case "cloudflare-stream":
    default:
      return null;
  }
}

function formatDuration(durationSeconds: number | null | undefined) {
  if (!durationSeconds || durationSeconds <= 0) {
    return null;
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  if (minutes === 0) {
    return `${seconds} s`;
  }

  return seconds > 0 ? `${minutes} min ${seconds} s` : `${minutes} min`;
}

function getModuleVideoStatus(status: ModuleProgressStatus) {
  return status === "completed"
    ? {
        label: "Completado",
        tone: "complete" as const,
      }
    : {
        label: "Pendiente",
        tone: "neutral" as const,
      };
}

function ModuleVideoPlayer({ video }: { video: ModuleVideo }) {
  const embedConfig = getVideoEmbedConfig(video);

  if (embedConfig) {
    return (
      <div className="mt-5 aspect-video w-full overflow-hidden rounded-2xl border border-cyan-200/20 bg-black shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          src={embedConfig.src}
          title={video.title}
        />
      </div>
    );
  }

  return (
    <div className="mt-5 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4 text-center sm:p-6">
      <p className="max-w-xl break-words text-base font-semibold leading-7 text-white sm:text-lg">
        {video.placeholder.trim() ||
          "El video de formación aún no está disponible."}
      </p>
    </div>
  );
}

export function ModuleVideosSection({
  moduleStatus,
  videos,
}: ModuleVideosSectionProps) {
  const hasMultipleVideos = videos.length > 1;
  const videoStatus = getModuleVideoStatus(moduleStatus);

  return (
    <StudentSection
      description="Contenido principal del módulo presentado dentro de la academia."
      title="Sesión de formación"
    >
      {videos.length > 0 ? (
        <div
          className={classNames(
            "grid gap-4",
            hasMultipleVideos && "lg:grid-cols-2",
          )}
        >
          {videos.map((video, index) => {
            const duration = formatDuration(video.durationSeconds);

            return (
              <StudentCard
                className="flex min-w-0 flex-col border-cyan-200/20 bg-[linear-gradient(135deg,var(--color-card-bg),var(--color-panel-bg))]"
                key={video.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                      {hasMultipleVideos
                        ? `Video ${index + 1}`
                        : "Video principal"}
                    </p>
                    <h3 className="mt-3 text-balance text-xl font-semibold text-white">
                      {video.title}
                    </h3>
                  </div>
                  <StudentStatusBadge tone={videoStatus.tone}>
                    {videoStatus.label}
                  </StudentStatusBadge>
                </div>

                <div className="mt-5 grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-cyan)] uppercase">
                      Objetivo de la lección
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {video.description ||
                        "Revisar el contenido central de está etapa del módulo."}
                    </p>
                  </div>
                  {duration ? (
                    <p className="rounded-full border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-white">
                      {duration}
                    </p>
                  ) : null}
                </div>

                <ModuleVideoPlayer video={video} />
              </StudentCard>
            );
          })}
        </div>
      ) : (
        <StudentEmptyState title="Este módulo aún no tiene videos disponibles.">
          El contenido aparecerá aquí cuando sea publicado.
        </StudentEmptyState>
      )}
    </StudentSection>
  );
}
