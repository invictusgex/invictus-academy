export type LearningWorkflowState =
  | "not_started"
  | "in_progress"
  | "requirements_met";

export type LearningWorkflowModuleSummary = {
  moduleId: string;
  moduleKey: string;
  order: number;
  title: string;
  completed: boolean;
  completedAt: string | null;
};

export type LearningWorkflowEvaluation = {
  allModulesCompleted: boolean;
  completedModules: number;
  completionPercent: number;
  enrollmentActive: boolean;
  modules: LearningWorkflowModuleSummary[];
  productId: string;
  profileId: string;
  publishedModules: number;
  workflowState: LearningWorkflowState;
};

export type LearningWorkflowEnrollmentRow = {
  expires_at: string | null;
  id: string;
  product_id: string;
  profile_id: string;
  revoked_at: string | null;
  starts_at: string;
  status: string;
};

export type LearningWorkflowModuleRow = {
  id: string;
  module_key: string;
  module_order: number;
  title: string;
};

export type LearningWorkflowProgressRow = {
  completed_at: string | null;
  module_key: string;
  progress_percent: number;
  status: string;
};
