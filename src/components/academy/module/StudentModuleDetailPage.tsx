"use client";

import { useMemo } from "react";

import { toStudentModuleStatus } from "@/components/academy/dashboard/student-dashboard-utils";
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
import type { Course, Module } from "@/types/academy";
import { formatModuleProgressStatusLabel } from "@/utils/module-progress";

type StudentModuleDetailPageProps = {
  academyModule: Module;
  course: Course;
};

export function StudentModuleDetailPage({
  academyModule,
  course,
}: StudentModuleDetailPageProps) {
  const { getPersistedModuleStatus } = useProgressContext();
  const status = toStudentModuleStatus(
    getPersistedModuleStatus(academyModule.id),
  );
  const statusLabel = formatModuleProgressStatusLabel(status);
  const thumbnailUrl = useModuleThumbnailUrl(academyModule.thumbnailUrl);
  const resourceUrls = useModuleResourceUrls(academyModule.resources);
  const orderedModules = useMemo(
    () =>
      [...course.modules].sort(
        (firstModule, secondModule) =>
          firstModule.number - secondModule.number ||
          firstModule.id.localeCompare(secondModule.id),
      ),
    [course.modules],
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
