import {
  StudentCard,
  StudentContentGrid,
  StudentEmptyState,
  StudentSection,
} from "@/components/student";
import type { ModuleVideo } from "@/types/academy";

type ModuleVideosSectionProps = {
  videos: ModuleVideo[];
};

export function ModuleVideosSection({ videos }: ModuleVideosSectionProps) {
  const hasMultipleVideos = videos.length > 1;

  return (
    <StudentSection
      description="Contenido principal del modulo presentado como una sola unidad academica."
      title="Videos"
    >
      {videos.length > 0 ? (
        <StudentContentGrid columns={2}>
          {videos.map((video, index) => (
            <StudentCard
              className="flex min-w-0 flex-col"
              key={video.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
                    {hasMultipleVideos ? `Video ${index + 1}` : "Video principal"}
                  </p>
                  <h3 className="mt-3 text-balance text-xl font-semibold text-white">
                    {video.title}
                  </h3>
                  {video.description ? (
                    <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {video.description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 text-center">
                <p className="max-w-xl break-words text-base font-semibold leading-7 text-white sm:text-lg">
                  {video.placeholder.trim() ||
                    "El video de formacion aun no esta disponible."}
                </p>
              </div>
            </StudentCard>
          ))}
        </StudentContentGrid>
      ) : (
        <StudentEmptyState title="Este modulo aun no tiene videos disponibles.">
          El contenido aparecera aqui cuando sea publicado.
        </StudentEmptyState>
      )}
    </StudentSection>
  );
}
