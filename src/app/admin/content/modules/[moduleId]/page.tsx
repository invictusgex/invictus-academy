import { AdminContentModuleDetailPage } from "@/components/admin/content/AdminContentModuleDetailPage";

type AdminContentModuleRouteProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

export default async function AdminContentModuleRoute({
  params,
}: AdminContentModuleRouteProps) {
  const { moduleId } = await params;

  return <AdminContentModuleDetailPage moduleId={moduleId} />;
}
