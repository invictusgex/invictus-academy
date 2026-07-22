import { AcademyShell } from "@/components/layout/academy-shell";
import { ScenarioDetailPage } from "@/components/scenarios/ScenarioDetailPage";

type AcademyScenarioDetailRouteProps = {
  params: Promise<{
    scenarioKey: string;
  }>;
};

export default async function AcademyScenarioDetailRoute({
  params,
}: AcademyScenarioDetailRouteProps) {
  const { scenarioKey } = await params;

  return (
    <AcademyShell>
      <ScenarioDetailPage scenarioKey={scenarioKey} />
    </AcademyShell>
  );
}
