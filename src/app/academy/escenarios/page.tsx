import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { NoActiveProgramState } from "@/components/academy/NoActiveProgramState";
import { AcademyShell } from "@/components/layout/academy-shell";
import { ScenarioLibraryPage } from "@/components/scenarios/ScenarioLibraryPage";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AcademyScenariosRoute() {
  const { profile } = await requireAcademyAuthContext();
  const supabase = await createSupabaseServerClient();
  const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);

  if (!academyAccess.hasAcademyProgramAccess) {
    return (
      <AcademyShell>
        <NoActiveProgramState description="La Biblioteca de Escenarios estará disponible cuando tengas acceso activo al Programa de Formación." />
      </AcademyShell>
    );
  }

  return (
    <AcademyShell>
      <ScenarioLibraryPage />
    </AcademyShell>
  );
}
