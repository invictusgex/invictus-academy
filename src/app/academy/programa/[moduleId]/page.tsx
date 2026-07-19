import { notFound } from "next/navigation";

import { LearningObjectives } from "@/components/academy/module/LearningObjectives";
import { ModuleBreadcrumb } from "@/components/academy/module/ModuleBreadcrumb";
import { ModuleHeader } from "@/components/academy/module/ModuleHeader";
import { ModuleNavigation } from "@/components/academy/module/ModuleNavigation";
import { ModulePurpose } from "@/components/academy/module/ModulePurpose";
import { ModuleResources } from "@/components/academy/module/ModuleResources";
import { TrainingSession } from "@/components/academy/module/TrainingSession";
import { AcademyShell } from "@/components/layout/academy-shell";
import { getAcademyModule, getProvisionalCourse } from "@/lib/academy-content";

type ModulePageProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

function normalizePurposeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
}

export default async function AcademyModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const course = getProvisionalCourse();
  const academyModule = getAcademyModule(moduleId);

  if (!academyModule) {
    notFound();
  }

  const previousModule = course.modules[academyModule.number - 2];
  const nextModule = course.modules[academyModule.number];
  const moduleOverview = academyModule.overview.trim();
  const moduleDescription = academyModule.description.trim();
  const normalizedOverview = normalizePurposeText(moduleOverview);
  const normalizedDescription = normalizePurposeText(moduleDescription);
  const purpose =
    moduleOverview && normalizedOverview !== normalizedDescription
      ? moduleOverview
      : "";

  return (
    <AcademyShell>
      <div className="space-y-6">
        <ModuleBreadcrumb moduleNumber={academyModule.number} />
        <ModuleHeader
          number={academyModule.number}
          title={academyModule.title}
          description={academyModule.description}
          competenciesCount={academyModule.learningObjectives.length}
        />
        <ModulePurpose purpose={purpose} />
        <LearningObjectives objectives={academyModule.learningObjectives} />
        <TrainingSession video={academyModule.video} />
        <ModuleResources resources={academyModule.resources} />
        <ModuleNavigation
          previousModule={previousModule}
          nextModule={nextModule}
        />
      </div>
    </AcademyShell>
  );
}
