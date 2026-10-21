import { redirect } from "next/navigation";
import { getCurrentServerUser } from "@/lib/auth/server";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { robots: { index: false, follow: false } };

export default async function AuthContinuePage() {
  const user = await getCurrentServerUser();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const access = await getAcademyEnrollmentAccess(user.id, supabase);
  redirect(access.hasAcademyProgramAccess ? "/academy" : "/");
}
