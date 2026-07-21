import { useState } from "react";

import { AdminContentService } from "@/lib/services/admin-content.service";
import type { AdminContentModule } from "@/lib/types/admin-content.types";

type AdminContentVideoOrderControlsProps = {
  disabledDown: boolean;
  disabledUp: boolean;
  moduleId: string;
  onUpdated: (module: AdminContentModule) => void;
  videoId: string;
};

export function AdminContentVideoOrderControls({
  disabledDown,
  disabledUp,
  moduleId,
  onUpdated,
  videoId,
}: AdminContentVideoOrderControlsProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function moveVideo(direction: -1 | 1) {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    const result = await AdminContentService.moveVideo(
      moduleId,
      videoId,
      direction,
    );

    if (result.ok) {
      onUpdated(result.module);
    }

    setIsSaving(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabledUp || isSaving}
        onClick={() => moveVideo(-1)}
        type="button"
      >
        Subir
      </button>
      <button
        className="min-h-10 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabledDown || isSaving}
        onClick={() => moveVideo(1)}
        type="button"
      >
        Bajar
      </button>
    </div>
  );
}
