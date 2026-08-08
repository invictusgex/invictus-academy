import { notFound, redirect } from "next/navigation";

import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { StudentModuleDetailPage } from "@/components/academy/module/StudentModuleDetailPage";
import { AcademyShell } from "@/components/layout/academy-shell";
import { getAcademyModule, getAcademyProgram } from "@/lib/academy";
import { academyProductSlug } from "@/lib/academy-product";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProgressProvider } from "@/providers/ProgressProvider";

type ModulePageProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AcademyModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const { profile } = await requireAcademyAuthContext();
  const supabase = await createSupabaseServerClient();
  const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);

  if (!academyAccess.hasAcademyProgramAccess) {
    redirect("/academy/programa");
  }

  const academyModule = await getAcademyModule(moduleId);

  if (!academyModule) {
    notFound();
  }

  const course = await getAcademyProgram();

  return (
    <AcademyShell>
      <ProgressProvider
        course={course}
        productSlug={academyProductSlug}
        programId={course.id}
      >
        <StudentModuleDetailPage
          academyModule={academyModule}
          productSlug={academyProductSlug}
        />
      </ProgressProvider>
    </AcademyShell>
  );
}
