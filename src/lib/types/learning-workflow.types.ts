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

export type CompletionRuleResult = {
  key: string;
  label: string;
  satisfied: boolean;
  currentValue: number | string | boolean | null;
  requiredValue: number | string | boolean | null;
  metadata?: Record<string, boolean | number | string | null>;
};

export type CompletionRuleEvaluation = {
  allSatisfied: boolean;
  rules: CompletionRuleResult[];
  satisfiedCount: number;
  totalCount: number;
};

export type CompletionRuleContext = {
  completedModules: number;
  enrollmentActive: boolean;
  modules: LearningWorkflowModuleSummary[];
  publishedModules: number;
  requiredForms: number;
  requiredTradingDays: number;
  submittedRequiredForms: number;
  tradingDays: number;
};

export type CompletionRule = {
  key: string;
  evaluate(context: CompletionRuleContext): CompletionRuleResult;
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
  requiredForms: number;
  requiredTradingDays: number;
  requirementsSatisfied: boolean;
  rules: CompletionRuleResult[];
  satisfiedRequirements: number;
  submittedRequiredForms: number;
  tradingDays: number;
  totalRequirements: number;
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
