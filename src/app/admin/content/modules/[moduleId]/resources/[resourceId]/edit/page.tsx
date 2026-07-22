import { AdminContentResourceEditPage } from "@/components/admin/content/AdminContentResourceEditPage";

type AdminContentResourceEditRouteProps = {
  params: Promise<{
    moduleId: string;
    resourceId: string;
  }>;
};

export default async function AdminContentResourceEditRoute({
  params,
}: AdminContentResourceEditRouteProps) {
  const { moduleId, resourceId } = await params;

  return (
    <AdminContentResourceEditPage
      moduleId={moduleId}
      resourceId={resourceId}
    />
  );
}
