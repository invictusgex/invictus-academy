import { AdminContentModuleEditPage } from "@/components/admin/content/AdminContentModuleEditPage";

type AdminContentModuleEditRouteProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AdminContentModuleEditRoute({
  params,
}: AdminContentModuleEditRouteProps) {
  const { moduleId } = await params;

  return <AdminContentModuleEditPage moduleId={moduleId} />;
}
