import { redirect } from "next/navigation";

import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { AcademyShell } from "@/components/layout/academy-shell";
import { ScenarioDetailPage } from "@/components/scenarios/ScenarioDetailPage";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AcademyScenarioDetailRouteProps = {
  params: Promise<{
    scenarioKey: string;
  }>;
};

export default async function AcademyScenarioDetailRoute({
  params,
}: AcademyScenarioDetailRouteProps) {
  const { scenarioKey } = await params;
  const { profile } = await requireAcademyAuthContext();
  const supabase = await createSupabaseServerClient();
  const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);

  if (!academyAccess.hasAcademyProgramAccess) {
    redirect("/academy/escenarios");
  }

  return (
    <AcademyShell>
      <ScenarioDetailPage scenarioKey={scenarioKey} />
    </AcademyShell>
  );
}
