import { AdminContentVideoEditPage } from "@/components/admin/content/AdminContentVideoEditPage";

type AdminContentVideoEditRouteProps = {
  params: Promise<{
    moduleId: string;
    videoId: string;
  }>;
};

export default async function AdminContentVideoEditRoute({
  params,
}: AdminContentVideoEditRouteProps) {
  const { moduleId, videoId } = await params;

  return <AdminContentVideoEditPage moduleId={moduleId} videoId={videoId} />;
}
