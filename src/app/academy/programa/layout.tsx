import { redirect } from "next/navigation";

import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { getAcademyProgram } from "@/lib/academy";
import {
  academyProductSlug,
  getAcademyEnrollmentAccess,
} from "@/lib/services/academy-access.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProgressProvider } from "@/providers/ProgressProvider";

export default async function AcademyProgramLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await requireAcademyAuthContext();
  const supabase = await createSupabaseServerClient();
  const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);

  if (!academyAccess.hasAccess) {
    redirect("/academy");
  }

  const course = await getAcademyProgram();

  return (
    <ProgressProvider
      course={course}
      productSlug={academyProductSlug}
      programId={course.id}
    >
      {children}
    </ProgressProvider>
  );
}
