import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminScenarioCreatePage } from "@/components/admin/scenarios/AdminScenarioCreatePage";

export default async function AdminScenarioCreateRoute() {
  await requireAdminServerContext();

  return <AdminScenarioCreatePage />;
}
