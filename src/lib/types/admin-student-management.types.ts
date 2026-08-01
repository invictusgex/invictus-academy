import type { Purchase } from "@/lib/types/commercial.types";
import type { FormDefinition, FormSubmission } from "@/lib/types/form.types";
import type {
  CompletionRuleResult,
  LearningWorkflowEvaluation,
} from "@/lib/types/learning-workflow.types";
import type { AdminMentorshipPreparationSummary } from "@/lib/services/mentorship-preparation.service";
import type { TradingDay } from "@/lib/types/trading-day.types";
import type {
  AdminStudent,
  AdminStudentEnrollment,
  AdminStudentProgressSummary,
} from "@/lib/types/admin-students.types";

export type AdminStudentSession101Status = {
  label: string;
  unlocked: boolean;
};

export type AdminStudentManagementListItem = {
  activeEnrollment: AdminStudentEnrollment | null;
  createdAt: string;
  email: string | null;
  fullName: string | null;
  id: string;
  progress: AdminStudentProgressSummary | null;
  session101: AdminStudentSession101Status;
};

export type AdminStudentManagementListResult = {
  page: number;
  pageSize: number;
  students: AdminStudentManagementListItem[];
  total: number;
  totalPages: number;
};

export type AdminStudentEnrollmentDetail = {
  enrollment: AdminStudentEnrollment;
  formDefinitions: FormDefinition[];
  formSubmissions: FormSubmission[];
  mentorshipPreparation: AdminMentorshipPreparationSummary | null;
  purchases: Purchase[];
  rules: CompletionRuleResult[];
  session101: AdminStudentSession101Status;
  tradingDays: TradingDay[];
  workflow: LearningWorkflowEvaluation | null;
};

export type AdminStudentManagementDetail = {
  enrollmentDetails: AdminStudentEnrollmentDetail[];
  purchases: Purchase[];
  student: AdminStudent;
};
