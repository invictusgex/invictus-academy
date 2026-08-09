import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { LearningWorkflowRepository } from "@/lib/repositories/learning-workflow.repository";
import { FormService } from "@/lib/services/form.service";
import { TradingDayService } from "@/lib/services/trading-day.service";
import type { Database } from "@/lib/supabase/database.types";
import {
  CompletionRuleEvaluator,
  initialLearningWorkflowRules,
} from "@/lib/services/learning-workflow-rules.service";
import type {
  LearningWorkflowEnrollmentRow,
  LearningWorkflowEvaluation,
  LearningWorkflowModuleRow,
  LearningWorkflowProgressRow,
  LearningWorkflowState,
} from "@/lib/types/learning-workflow.types";

function getCompletionPercent(completedModules: number, publishedModules: number) {
  return publishedModules > 0
    ? Math.round((completedModules / publishedModules) * 100)
    : 0;
}

function isEnrollmentActive(
  enrollment: LearningWorkflowEnrollmentRow | null,
  now = new Date(),
) {
  if (!enrollment) {
    return false;
  }

  if (enrollment.status !== "active" || enrollment.revoked_at) {
    return false;
  }

  const nowTime = now.getTime();
  const startsAt = new Date(enrollment.starts_at).getTime();
  const expiresAt = enrollment.expires_at
    ? new Date(enrollment.expires_at).getTime()
    : null;

  return startsAt <= nowTime && (expiresAt === null || expiresAt > nowTime);
}

function isModuleCompleted(progress: LearningWorkflowProgressRow | undefined) {
  return (
    progress?.status === "completed" ||
    progress?.progress_percent === 100 ||
    Boolean(progress?.completed_at)
  );
}

function hasStartedProgress(progressRows: LearningWorkflowProgressRow[]) {
  return progressRows.some(
    (progress) =>
      progress.status === "in_progress" ||
      progress.status === "completed" ||
      progress.progress_percent > 0 ||
      Boolean(progress.completed_at),
  );
}

function getWorkflowState({
  enrollmentActive,
  requirementsSatisfied,
  started,
}: {
  enrollmentActive: boolean;
  requirementsSatisfied: boolean;
  started: boolean;
}): LearningWorkflowState {
  if (!enrollmentActive || !started) {
    return "not_started";
  }

  if (requirementsSatisfied) {
    return "requirements_met";
  }

  return "in_progress";
}

function mapModules(
  modules: LearningWorkflowModuleRow[],
  progressRows: LearningWorkflowProgressRow[],
) {
  const progressByModuleKey = new Map(
    progressRows.map((progress) => [progress.module_key, progress]),
  );

  return modules.map((academyModule) => {
    const progress = progressByModuleKey.get(academyModule.module_key);
    const completed = isModuleCompleted(progress);

    return {
      completed,
      completedAt: completed ? progress?.completed_at ?? null : null,
      moduleId: academyModule.id,
      moduleKey: academyModule.module_key,
      order: academyModule.module_order,
      title: academyModule.title,
    };
  });
}

export const LearningWorkflowService = {
  /**
   * Evaluates the current read-only learning workflow state for a student and product.
   */
  async evaluateStudentWorkflow(
    profileId: string,
    productId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<LearningWorkflowEvaluation> {
    const [enrollment, publishedModules, progressRows] = await Promise.all([
      LearningWorkflowRepository.getEnrollment(
        { productId, profileId },
        supabase,
      ),
      LearningWorkflowRepository.listPublishedModules(productId, supabase),
      LearningWorkflowRepository.listModuleProgress(
        { productId, profileId },
        supabase,
      ),
    ]);
    const enrollmentActive = isEnrollmentActive(enrollment);
    const practiceRequirementOverride =
      enrollmentActive && enrollment
        ? await LearningWorkflowRepository.getActivePracticeRequirementOverride(
            {
              enrollmentId: enrollment.id,
              productId,
              profileId,
            },
            supabase,
          )
        : null;
    const requiredFormsProgress = await FormService.getRequiredFormsProgress(
      {
        enrollmentId: enrollmentActive ? enrollment?.id ?? null : null,
        productId,
        profileId,
      },
      supabase,
    );
    const tradingDaysProgress = await TradingDayService.getTradingDaysProgress(
      {
        enrollmentId: enrollmentActive ? enrollment?.id ?? null : null,
        productId,
        profileId,
      },
      supabase,
    );
    const modules = mapModules(publishedModules, progressRows);
    const completedModules = enrollmentActive
      ? modules.filter((academyModule) => academyModule.completed).length
      : 0;
    const totalModules = publishedModules.length;
    const allModulesCompleted =
      enrollmentActive && totalModules > 0 && completedModules === totalModules;
    const ruleEvaluation = CompletionRuleEvaluator.evaluate(
      initialLearningWorkflowRules,
      {
        completedModules,
        enrollmentActive,
        modules,
        practiceRequirementWaived: Boolean(practiceRequirementOverride),
        publishedModules: totalModules,
        requiredForms: requiredFormsProgress.requiredForms,
        requiredTradingDays: tradingDaysProgress.requiredTradingDays,
        submittedRequiredForms: requiredFormsProgress.submittedRequiredForms,
        tradingDays: tradingDaysProgress.registeredTradingDays,
      },
    );

    return {
      allModulesCompleted,
      completedModules,
      completionPercent: getCompletionPercent(completedModules, totalModules),
      enrollmentActive,
      modules,
      practiceRequirementWaived: Boolean(practiceRequirementOverride),
      productId,
      profileId,
      publishedModules: totalModules,
      requiredForms: requiredFormsProgress.requiredForms,
      requiredTradingDays: tradingDaysProgress.requiredTradingDays,
      requirementsSatisfied: ruleEvaluation.allSatisfied,
      rules: ruleEvaluation.rules,
      satisfiedRequirements: ruleEvaluation.satisfiedCount,
      submittedRequiredForms: requiredFormsProgress.submittedRequiredForms,
      tradingDays: tradingDaysProgress.registeredTradingDays,
      totalRequirements: ruleEvaluation.totalCount,
      workflowState: getWorkflowState({
        enrollmentActive,
        requirementsSatisfied: ruleEvaluation.allSatisfied,
        started: hasStartedProgress(progressRows),
      }),
    };
  },
};
