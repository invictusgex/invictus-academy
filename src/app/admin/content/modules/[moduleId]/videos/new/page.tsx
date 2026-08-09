import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminContentVideoCreatePage } from "@/components/admin/content/AdminContentVideoCreatePage";

type AdminContentVideoCreateRouteProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AdminContentVideoCreateRoute({
  params,
}: AdminContentVideoCreateRouteProps) {
  await requireAdminServerContext();

  const { moduleId } = await params;

  return <AdminContentVideoCreatePage moduleId={moduleId} />;
}
