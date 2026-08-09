import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminStudentDetailPage } from "@/components/admin/students/AdminStudentDetailPage";
import { AdminStudentManagementService } from "@/lib/services/admin-student-management.service";
import { MentorshipRequirementOverrideService } from "@/lib/services/mentorship-requirement-override.service";

type AdminStudentDetailRouteProps = {
  params: Promise<{
    profileId: string;
  }>;
};

function getRequiredFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Datos insuficientes para actualizar el requisito.");
  }

  return value.trim();
}

async function waivePracticeRequirement(formData: FormData) {
  "use server";

  const { profile, supabase } = await requireAdminServerContext();
  const profileId = getRequiredFormValue(formData, "profileId");
  const productId = getRequiredFormValue(formData, "productId");
  const enrollmentId = getRequiredFormValue(formData, "enrollmentId");
  const reasonValue = formData.get("reason");
  const reason =
    typeof reasonValue === "string" && reasonValue.trim().length > 0
      ? reasonValue.trim()
      : null;

  await MentorshipRequirementOverrideService.waivePracticeRequirement(
    {
      adminProfileId: profile.id,
      enrollmentId,
      productId,
      profileId,
      reason,
    },
    supabase,
  );
  revalidatePath(`/admin/students/${profileId}`);
}

async function revokePracticeRequirementWaiver(formData: FormData) {
  "use server";

  const { profile, supabase } = await requireAdminServerContext();
  const profileId = getRequiredFormValue(formData, "profileId");
  const productId = getRequiredFormValue(formData, "productId");
  const enrollmentId = getRequiredFormValue(formData, "enrollmentId");

  await MentorshipRequirementOverrideService.revokePracticeRequirementWaiver(
    {
      adminProfileId: profile.id,
      enrollmentId,
      productId,
      profileId,
    },
    supabase,
  );
  revalidatePath(`/admin/students/${profileId}`);
}

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

  return (
    <AdminStudentDetailPage
      detail={detail}
      onRevokePracticeRequirementWaiver={revokePracticeRequirementWaiver}
      onWaivePracticeRequirement={waivePracticeRequirement}
    />
  );
}
