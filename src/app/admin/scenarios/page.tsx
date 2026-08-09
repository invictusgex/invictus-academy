import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminScenariosPage } from "@/components/admin/scenarios/AdminScenariosPage";

export default async function AdminScenariosRoute() {
  await requireAdminServerContext();

  return <AdminScenariosPage />;
}
