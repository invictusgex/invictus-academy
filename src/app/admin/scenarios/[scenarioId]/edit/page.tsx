import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminScenarioEditPage } from "@/components/admin/scenarios/AdminScenarioEditPage";

type AdminScenarioEditRouteProps = {
  params: Promise<{
    scenarioId: string;
  }>;
};

export default async function AdminScenarioEditRoute({
  params,
}: AdminScenarioEditRouteProps) {
  await requireAdminServerContext();

  const { scenarioId } = await params;

  return <AdminScenarioEditPage scenarioId={scenarioId} />;
}
