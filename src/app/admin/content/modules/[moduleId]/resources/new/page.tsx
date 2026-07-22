import { AdminContentResourceCreatePage } from "@/components/admin/content/AdminContentResourceCreatePage";

type AdminContentResourceCreateRouteProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AdminContentResourceCreateRoute({
  params,
}: AdminContentResourceCreateRouteProps) {
  const { moduleId } = await params;

  return <AdminContentResourceCreatePage moduleId={moduleId} />;
}
