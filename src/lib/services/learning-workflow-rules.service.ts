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
      label: "Completar todos los módulos publicados",
      metadata: {
        enrollmentActive: context.enrollmentActive,
        publishedModules: context.publishedModules,
      },
      requiredValue: context.publishedModules,
      satisfied,
    };
  },
};

export const RequiredFormsRule: CompletionRule = {
  key: "required_forms",
  evaluate(context: CompletionRuleContext): CompletionRuleResult {
    const satisfied =
      context.enrollmentActive &&
      context.submittedRequiredForms === context.requiredForms;

    return {
      currentValue: context.submittedRequiredForms,
      key: RequiredFormsRule.key,
      label: "Responder formularios requeridos",
      metadata: {
        enrollmentActive: context.enrollmentActive,
        requiredForms: context.requiredForms,
      },
      requiredValue: context.requiredForms,
      satisfied,
    };
  },
};

export const TradingDaysRule: CompletionRule = {
  key: "trading_days",
  evaluate(context: CompletionRuleContext): CompletionRuleResult {
    const satisfied =
      context.enrollmentActive &&
      context.tradingDays >= context.requiredTradingDays;

    return {
      currentValue: context.tradingDays,
      key: TradingDaysRule.key,
      label: "Registrar días de trading",
      metadata: {
        enrollmentActive: context.enrollmentActive,
        requiredTradingDays: context.requiredTradingDays,
      },
      requiredValue: context.requiredTradingDays,
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
  RequiredFormsRule,
  TradingDaysRule,
];
