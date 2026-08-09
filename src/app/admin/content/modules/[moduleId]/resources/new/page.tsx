import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminContentResourceCreatePage } from "@/components/admin/content/AdminContentResourceCreatePage";

type AdminContentResourceCreateRouteProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AdminContentResourceCreateRoute({
  params,
}: AdminContentResourceCreateRouteProps) {
  await requireAdminServerContext();

  const { moduleId } = await params;

  return <AdminContentResourceCreatePage moduleId={moduleId} />;
}
