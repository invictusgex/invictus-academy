import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminContentModuleDetailPage } from "@/components/admin/content/AdminContentModuleDetailPage";

type AdminContentModuleRouteProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AdminContentModuleRoute({
  params,
}: AdminContentModuleRouteProps) {
  await requireAdminServerContext();

  const { moduleId } = await params;

  return <AdminContentModuleDetailPage moduleId={moduleId} />;
}
