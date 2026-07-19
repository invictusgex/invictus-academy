import Link from "next/link";

import type { ModuleVideo } from "@/types/academy";

type SessionCompletionPanelProps = {
  isModuleCompleted: boolean;
  nextVideo?: ModuleVideo;
  nextVideoNumber?: number;
  moduleId: string;
  selectedSessionNumber: number;
};

export function SessionCompletionPanel({
  isModuleCompleted,
  moduleId,
  nextVideo,
  nextVideoNumber,
  selectedSessionNumber,
}: SessionCompletionPanelProps) {
  if (isModuleCompleted) {
    return (
      <div className="mt-6 rounded-xl border border-[var(--color-cyan)] bg-[var(--color-card-bg)] p-5">
        <h3 className="text-lg font-semibold text-white">Módulo completado</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          Has completado todas las sesiones de este módulo. Tu progreso ha sido
          guardado.
        </p>
      </div>
    );
  }

  if (!nextVideo || !nextVideoNumber) {
    return null;
  }

  return (
    <div className="mt-6 rounded-xl border border-[var(--color-cyan)] bg-[var(--color-card-bg)] p-5">
      <h3 className="text-lg font-semibold text-white">
        Sesión {selectedSessionNumber} completada
      </h3>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
        Has establecido los fundamentos necesarios para interpretar la exposición
        gamma y comprender la función de sus niveles principales.
      </p>
      <div className="mt-5">
        <p className="text-xs font-semibold tracking-[0.16em] text-[var(--color-cyan)] uppercase">
          Siguiente sesión
        </p>
        <p className="mt-2 break-words text-sm font-semibold text-white">
          {nextVideo.title}
        </p>
        <Link
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-center text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto"
          href={`/academy/programa/${moduleId}?video=${nextVideoNumber}`}
        >
          Continuar con la Sesión {nextVideoNumber}
        </Link>
      </div>
    </div>
  );
}
