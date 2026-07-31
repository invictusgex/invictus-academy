import { notFound } from "next/navigation";

import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminStudentDetailPage } from "@/components/admin/students/AdminStudentDetailPage";
import { AdminStudentManagementService } from "@/lib/services/admin-student-management.service";

type AdminStudentDetailRouteProps = {
  params: Promise<{
    profileId: string;
  }>;
};

export default async function AdminStudentDetailRoute({
  params,
}: AdminStudentDetailRouteProps) {
  const { profileId } = await params;
  const { supabase } = await requireAdminServerContext();
  const detail = await AdminStudentManagementService.getStudentDetail(
    profileId,
    supabase,
  );

  if (!detail) {
    notFound();
  }

  return <AdminStudentDetailPage detail={detail} />;
}
