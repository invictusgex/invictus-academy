import type { ModuleVideo } from "@/types/academy";

type TrainingSessionProps = {
  video?: ModuleVideo;
};

export function TrainingSession({ video }: TrainingSessionProps) {
  const hasAvailableVideo = Boolean(video?.placeholder.trim());

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-6 sm:p-8">
      <p className="text-sm font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Contenido principal del módulo
      </p>
      <h2 className="mt-3 text-xl font-semibold text-white">
        Sesión de formación
      </h2>
      <div className="mt-6 flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 text-center">
        <p className="max-w-lg break-words text-base font-semibold leading-7 text-white sm:text-lg">
          {hasAvailableVideo
            ? video?.placeholder
            : "La sesión de formación aún no está disponible."}
        </p>
      </div>
    </section>
  );
}
