import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminScenarioDetailPage } from "@/components/admin/scenarios/AdminScenarioDetailPage";

type AdminScenarioDetailRouteProps = {
  params: Promise<{
    scenarioId: string;
  }>;
};

export default async function AdminScenarioDetailRoute({
  params,
}: AdminScenarioDetailRouteProps) {
  await requireAdminServerContext();

  const { scenarioId } = await params;

  return <AdminScenarioDetailPage scenarioId={scenarioId} />;
}
