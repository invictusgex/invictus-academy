import { AdminContentVideoCreatePage } from "@/components/admin/content/AdminContentVideoCreatePage";

type AdminContentVideoCreateRouteProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AdminContentVideoCreateRoute({
  params,
}: AdminContentVideoCreateRouteProps) {
  const { moduleId } = await params;

  return <AdminContentVideoCreatePage moduleId={moduleId} />;
}
