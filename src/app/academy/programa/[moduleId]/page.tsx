import { notFound } from "next/navigation";

import { StudentModuleDetailPage } from "@/components/academy/module/StudentModuleDetailPage";
import { AcademyShell } from "@/components/layout/academy-shell";
import { getAcademyModule, getAcademyProgram } from "@/lib/academy";

type ModulePageProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AcademyModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const course = await getAcademyProgram();
  const academyModule = await getAcademyModule(moduleId);

  if (!academyModule) {
    notFound();
  }

  return (
    <AcademyShell>
      <StudentModuleDetailPage academyModule={academyModule} course={course} />
    </AcademyShell>
  );
}
