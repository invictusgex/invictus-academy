import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminContentPage } from "@/components/admin/content/AdminContentPage";

export default async function AdminContentRoute() {
  await requireAdminServerContext();

  return <AdminContentPage />;
}
