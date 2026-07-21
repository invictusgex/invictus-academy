import { AdminStudentDetailPage } from "@/components/admin/students/AdminStudentDetailPage";

type AdminStudentDetailRouteProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminStudentDetailRoute({
  params,
}: AdminStudentDetailRouteProps) {
  const { userId } = await params;

  return <AdminStudentDetailPage userId={userId} />;
}
