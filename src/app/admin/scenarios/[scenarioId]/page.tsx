import { AdminScenarioDetailPage } from "@/components/admin/scenarios/AdminScenarioDetailPage";

type AdminScenarioDetailRouteProps = {
  params: Promise<{
    scenarioId: string;
  }>;
};

export default async function AdminScenarioDetailRoute({
  params,
}: AdminScenarioDetailRouteProps) {
  const { scenarioId } = await params;

  return <AdminScenarioDetailPage scenarioId={scenarioId} />;
}
