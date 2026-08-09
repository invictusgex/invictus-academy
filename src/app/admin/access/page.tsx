import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminAccessPage } from "@/components/admin/access/AdminAccessPage";

export default async function AdminAccessRoute() {
  await requireAdminServerContext();

  return <AdminAccessPage />;
}
