"use client";

import { useMemo } from "react";

import { ModuleCompletionPanel } from "@/components/academy/module/ModuleCompletionPanel";
import { ModuleReflectionPanel } from "@/components/academy/module/ModuleReflectionPanel";
import {
  getValidModuleResources,
  ModuleResourcesSection,
} from "@/components/academy/module/ModuleResourcesSection";
import { ModuleVideosSection } from "@/components/academy/module/ModuleVideosSection";
import { StudentModuleHero } from "@/components/academy/module/StudentModuleHero";
import { StudentModuleNavigation } from "@/components/academy/module/StudentModuleNavigation";
import {
  useModuleResourceUrls,
} from "@/components/academy/module/useModuleAssetUrls";
import { useProgressContext } from "@/contexts/ProgressContext";
import type { Module } from "@/types/academy";
import { formatModuleProgressStatusLabel } from "@/utils/module-progress";

type StudentModuleDetailPageProps = {
  academyModule: Module;
  productSlug: string;
};

export function StudentModuleDetailPage({
  academyModule,
  productSlug,
}: StudentModuleDetailPageProps) {
  const { progress } = useProgressContext();
  const moduleProgress = progress.modulesById[academyModule.id];
  const status = moduleProgress?.status ?? "not-started";
  const statusLabel = formatModuleProgressStatusLabel(status);
  const validResources = useMemo(
    () => getValidModuleResources(academyModule.resources),
    [academyModule.resources],
  );
  const resourceUrls = useModuleResourceUrls(validResources);
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
      />

      <div id="videos">
        <ModuleVideosSection
          moduleStatus={status}
          videos={academyModule.videos}
        />
      </div>

      <ModuleReflectionPanel
        moduleKey={academyModule.id}
        productSlug={productSlug}
      />

      <ModuleResourcesSection
        resourceUrls={resourceUrls}
        resources={validResources}
      />

      <ModuleCompletionPanel
        moduleId={academyModule.id}
        nextModule={nextModule}
        status={status}
      />

      <StudentModuleNavigation
        nextModule={nextModule}
        previousModule={previousModule}
      />
    </div>
  );
}
