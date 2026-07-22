import { AcademyShell } from "@/components/layout/academy-shell";
import { ScenarioLibraryPage } from "@/components/scenarios/ScenarioLibraryPage";

export default function AcademyScenariosRoute() {
  return (
    <AcademyShell>
      <ScenarioLibraryPage />
    </AcademyShell>
  );
}
