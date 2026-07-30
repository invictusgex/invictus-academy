import "server-only";

import type {
  CompletionRule,
  CompletionRuleContext,
  CompletionRuleEvaluation,
  CompletionRuleResult,
} from "@/lib/types/learning-workflow.types";

export const ModulesCompletedRule: CompletionRule = {
  key: "modules_completed",
  evaluate(context: CompletionRuleContext): CompletionRuleResult {
    const satisfied =
      context.enrollmentActive &&
      context.publishedModules > 0 &&
      context.completedModules === context.publishedModules;

    return {
      currentValue: context.completedModules,
      key: ModulesCompletedRule.key,
      label: "Completar todos los modulos publicados",
      metadata: {
        enrollmentActive: context.enrollmentActive,
        publishedModules: context.publishedModules,
      },
      requiredValue: context.publishedModules,
      satisfied,
    };
  },
};

export const CompletionRuleEvaluator = {
  evaluate(
    rules: CompletionRule[],
    context: CompletionRuleContext,
  ): CompletionRuleEvaluation {
    const orderedRules = [...rules].sort((firstRule, secondRule) =>
      firstRule.key.localeCompare(secondRule.key),
    );
    const results = orderedRules.map((rule) => rule.evaluate(context));
    const satisfiedCount = results.filter((result) => result.satisfied).length;

    return {
      allSatisfied: results.length > 0 && satisfiedCount === results.length,
      rules: results,
      satisfiedCount,
      totalCount: results.length,
    };
  },
};

export const initialLearningWorkflowRules: CompletionRule[] = [
  ModulesCompletedRule,
];
