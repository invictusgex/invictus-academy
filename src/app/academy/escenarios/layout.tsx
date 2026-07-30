import { redirect } from "next/navigation";

import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AcademyScenariosLayout({
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

  return children;
}
