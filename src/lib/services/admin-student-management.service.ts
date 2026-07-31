import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { adminStudentsConfig } from "@/config/admin-students";
import { FormRepository } from "@/lib/repositories/form.repository";
import { PurchaseRepository } from "@/lib/repositories/purchase.repository";
import { TradingDayRepository } from "@/lib/repositories/trading-day.repository";
import { AdminStudentsService } from "@/lib/services/admin-students.service";
import { LearningWorkflowService } from "@/lib/services/learning-workflow.service";
import type { Database } from "@/lib/supabase/database.types";
import type {
  AdminStudentManagementDetail,
  AdminStudentManagementListItem,
  AdminStudentManagementListResult,
  AdminStudentSession101Status,
} from "@/lib/types/admin-student-management.types";
import type {
  AdminStudent,
  AdminStudentEnrollment,
} from "@/lib/types/admin-students.types";

function getSession101Status(unlocked: boolean): AdminStudentSession101Status {
  return {
    label: unlocked
      ? adminStudentsConfig.session101.unlockedLabel
      : adminStudentsConfig.session101.lockedLabel,
    unlocked,
  };
}

function getPrimaryActiveEnrollment(student: AdminStudent) {
  return (
    student.enrollments.find((enrollment) => enrollment.status === "active") ??
    null
  );
}

function getEnrollmentProgress(
  student: AdminStudent,
  enrollment: AdminStudentEnrollment | null,
) {
  if (!enrollment) {
    return null;
  }

  return (
    student.progress.find(
      (progress) => progress.productId === enrollment.productId,
    ) ?? null
  );
}

async function getWorkflowForEnrollment(
  student: AdminStudent,
  enrollment: AdminStudentEnrollment,
  supabase: SupabaseClient<Database>,
) {
  if (enrollment.status !== "active") {
    return null;
  }

  return LearningWorkflowService.evaluateStudentWorkflow(
    student.id,
    enrollment.productId,
    supabase,
  );
}

async function mapListItem(
  student: AdminStudent,
  supabase: SupabaseClient<Database>,
): Promise<AdminStudentManagementListItem> {
  const activeEnrollment = getPrimaryActiveEnrollment(student);
  const workflow = activeEnrollment
    ? await getWorkflowForEnrollment(student, activeEnrollment, supabase)
    : null;

  return {
    activeEnrollment,
    createdAt: student.createdAt,
    email: student.email,
    fullName: student.fullName,
    id: student.id,
    progress: getEnrollmentProgress(student, activeEnrollment),
    session101: getSession101Status(Boolean(workflow?.requirementsSatisfied)),
  };
}

export const AdminStudentManagementService = {
  async listStudents(
    input: {
      page?: number;
      query?: string;
      sortBy?: "createdAt" | "email" | "name";
    },
    supabase: SupabaseClient<Database>,
  ): Promise<AdminStudentManagementListResult> {
    const result = await AdminStudentsService.listStudents(
      {
        page: input.page,
        pageSize: adminStudentsConfig.pageSize,
        query: input.query,
        sortBy: input.sortBy,
        sortDirection: "desc",
      },
      supabase,
    );
    const students = await Promise.all(
      result.students.map((student) => mapListItem(student, supabase)),
    );

    return {
      page: result.page,
      pageSize: result.pageSize,
      students,
      total: result.total,
      totalPages: result.totalPages,
    };
  },

  async getStudentDetail(
    profileId: string,
    supabase: SupabaseClient<Database>,
  ): Promise<AdminStudentManagementDetail | null> {
    const student = await AdminStudentsService.getStudentForAdmin(
      profileId,
      supabase,
    );

    if (!student) {
      return null;
    }

    const purchases = await PurchaseRepository.listByProfile(profileId, supabase);
    const enrollmentDetails = await Promise.all(
      student.enrollments.map(async (enrollment) => {
        const [
          formDefinitions,
          formSubmissions,
          tradingDays,
          workflow,
        ] = await Promise.all([
          FormRepository.listPublishedDefinitionsByProduct(
            enrollment.productId,
            supabase,
          ),
          FormRepository.listSubmissionsByScope(
            {
              productId: enrollment.productId,
              profileId,
            },
            supabase,
          ),
          TradingDayRepository.listByScope(
            {
              productId: enrollment.productId,
              profileId,
            },
            supabase,
          ),
          getWorkflowForEnrollment(student, enrollment, supabase),
        ]);

        return {
          enrollment,
          formDefinitions: formDefinitions.filter(
            (definition) => definition.isRequired,
          ),
          formSubmissions,
          purchases: purchases.filter(
            (purchase) => purchase.productId === enrollment.productId,
          ),
          rules: workflow?.rules ?? [],
          session101: getSession101Status(
            Boolean(workflow?.requirementsSatisfied),
          ),
          tradingDays,
          workflow,
        };
      }),
    );

    return {
      enrollmentDetails,
      purchases,
      student,
    };
  },
};
