"use client";

import { useMemo } from "react";

import { ModuleCompletionPanel } from "@/components/academy/module/ModuleCompletionPanel";
import { ModuleObjectivesSection } from "@/components/academy/module/ModuleObjectivesSection";
import { ModuleResourcesSection } from "@/components/academy/module/ModuleResourcesSection";
import { ModuleVideosSection } from "@/components/academy/module/ModuleVideosSection";
import { StudentModuleHero } from "@/components/academy/module/StudentModuleHero";
import { StudentModuleNavigation } from "@/components/academy/module/StudentModuleNavigation";
import {
  useModuleResourceUrls,
  useModuleThumbnailUrl,
} from "@/components/academy/module/useModuleAssetUrls";
import { useProgressContext } from "@/contexts/ProgressContext";
import type { Module } from "@/types/academy";
import { formatModuleProgressStatusLabel } from "@/utils/module-progress";

type StudentModuleDetailPageProps = {
  academyModule: Module;
};

export function StudentModuleDetailPage({
  academyModule,
}: StudentModuleDetailPageProps) {
  const { progress } = useProgressContext();
  const moduleProgress = progress.modulesById[academyModule.id];
  const status = moduleProgress?.status ?? "not-started";
  const statusLabel = formatModuleProgressStatusLabel(status);
  const thumbnailUrl = useModuleThumbnailUrl(academyModule.thumbnailUrl);
  const resourceUrls = useModuleResourceUrls(academyModule.resources);
  const orderedModules = useMemo(
    () => progress.modules.map((progressModule) => progressModule.academyModule),
    [progress.modules],
  );
  const currentIndex = orderedModules.findIndex(
    (moduleItem) => moduleItem.id === academyModule.id,
  );
  const previousModule =
    currentIndex > 0 ? orderedModules[currentIndex - 1] : undefined;
  const nextModule =
    currentIndex >= 0 && currentIndex < orderedModules.length - 1
      ? orderedModules[currentIndex + 1]
      : undefined;

  return (
    <div className="space-y-6">
      <StudentModuleHero
        academyModule={academyModule}
        status={status}
        statusLabel={statusLabel}
        thumbnailUrl={thumbnailUrl}
      />

      <ModuleCompletionPanel moduleId={academyModule.id} status={status} />

      <div id="videos">
        <ModuleVideosSection videos={academyModule.videos} />
      </div>

      <ModuleResourcesSection
        resourceUrls={resourceUrls}
        resources={academyModule.resources}
      />

      <ModuleObjectivesSection objectives={academyModule.learningObjectives} />

      <StudentModuleNavigation
        nextModule={nextModule}
        previousModule={previousModule}
      />
    </div>
  );
}
