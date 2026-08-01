import { notFound } from "next/navigation";

import { StudentModuleDetailPage } from "@/components/academy/module/StudentModuleDetailPage";
import { AcademyShell } from "@/components/layout/academy-shell";
import { getAcademyModule } from "@/lib/academy";
import { academyProductSlug } from "@/lib/academy-product";

type ModulePageProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AcademyModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const academyModule = await getAcademyModule(moduleId);

  if (!academyModule) {
    notFound();
  }

  return (
    <AcademyShell>
      <StudentModuleDetailPage
        academyModule={academyModule}
        productSlug={academyProductSlug}
      />
    </AcademyShell>
  );
}
