import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminContentModuleEditPage } from "@/components/admin/content/AdminContentModuleEditPage";

type AdminContentModuleEditRouteProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AdminContentModuleEditRoute({
  params,
}: AdminContentModuleEditRouteProps) {
  await requireAdminServerContext();

  const { moduleId } = await params;

  return <AdminContentModuleEditPage moduleId={moduleId} />;
}
