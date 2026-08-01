import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { ModuleReflectionRepository } from "@/lib/repositories/module-reflection.repository";
import { LearningWorkflowService } from "@/lib/services/learning-workflow.service";
import type { Database } from "@/lib/supabase/database.types";

export type MentorshipPreparationModule = {
  attachmentCount: number;
  completed: boolean;
  moduleKey: string;
  order: number;
  reflectionUpdatedAt: string | null;
  title: string;
  hasReflection: boolean;
};

export type MentorshipPreparationSummary = {
  completedModules: number;
  moduleReflectionCount: number;
  modules: MentorshipPreparationModule[];
  publishedModules: number;
  requirementsSatisfied: boolean;
  rules: {
    key: string;
    label: string;
    satisfied: boolean;
  }[];
  status: "En preparación" | "Lista para agendar";
  totalAttachments: number;
  tradingDays: number;
};

function hasMeaningfulReflection(content: string) {
  return content.trim().length > 0;
}

export const MentorshipPreparationService = {
  async getStudentPreparation(
    input: {
      productId: string;
      profileId: string;
    },
    supabase: SupabaseClient<Database>,
  ): Promise<MentorshipPreparationSummary> {
    const [workflow, reflections, attachments] = await Promise.all([
      LearningWorkflowService.evaluateStudentWorkflow(
        input.profileId,
        input.productId,
        supabase,
      ),
      ModuleReflectionRepository.listByProfileAndProduct(input, supabase),
      ModuleReflectionRepository.listAttachmentsByProfileAndProduct(
        input,
        supabase,
      ),
    ]);
    const reflectionsByModule = new Map(
      reflections.map((reflection) => [reflection.module_key, reflection]),
    );
    const attachmentCountByModule = new Map<string, number>();

    for (const attachment of attachments) {
      attachmentCountByModule.set(
        attachment.module_key,
        (attachmentCountByModule.get(attachment.module_key) ?? 0) + 1,
      );
    }

    const modules = workflow.modules.map((academyModule) => {
      const reflection = reflectionsByModule.get(academyModule.moduleKey);
      const hasReflection = reflection
        ? hasMeaningfulReflection(reflection.content)
        : false;

      return {
        attachmentCount:
          attachmentCountByModule.get(academyModule.moduleKey) ?? 0,
        completed: academyModule.completed,
        hasReflection,
        moduleKey: academyModule.moduleKey,
        order: academyModule.order,
        reflectionUpdatedAt: hasReflection ? reflection?.updated_at ?? null : null,
        title: academyModule.title,
      };
    });

    return {
      completedModules: workflow.completedModules,
      moduleReflectionCount: modules.filter((moduleItem) => moduleItem.hasReflection)
        .length,
      modules,
      publishedModules: workflow.publishedModules,
      requirementsSatisfied: workflow.requirementsSatisfied,
      rules: workflow.rules.map((rule) => ({
        key: rule.key,
        label: rule.label,
        satisfied: rule.satisfied,
      })),
      status: workflow.requirementsSatisfied
        ? "Lista para agendar"
        : "En preparación",
      totalAttachments: attachments.length,
      tradingDays: workflow.tradingDays,
    };
  },
};
