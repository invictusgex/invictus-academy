import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { ModuleReflectionRepository } from "@/lib/repositories/module-reflection.repository";
import { StorageRepository } from "@/lib/repositories/storage.repository";
import { LearningWorkflowService } from "@/lib/services/learning-workflow.service";
import type { Database } from "@/lib/supabase/database.types";
import type { LearningWorkflowEvaluation } from "@/lib/types/learning-workflow.types";
import type { ModuleReflectionAttachmentRow } from "@/lib/types/module-reflection.types";

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

export type MentorshipPreparationAttachmentPreview = {
  createdAt: string;
  id: string;
  mimeType: string;
  originalName: string;
  signedUrl: string | null;
  sizeBytes: number;
  storagePath: string;
};

export type AdminMentorshipPreparationModule = MentorshipPreparationModule & {
  attachments: MentorshipPreparationAttachmentPreview[];
  moduleId: string;
  reflectionContent: string | null;
};

export type AdminMentorshipPreparationSummary = Omit<
  MentorshipPreparationSummary,
  "modules"
> & {
  completionPercent: number;
  modules: AdminMentorshipPreparationModule[];
  pendingItems: string[];
  requiredTradingDays: number;
};

function hasMeaningfulReflection(content: string) {
  return content.trim().length > 0;
}

function groupAttachmentsByModule(attachments: ModuleReflectionAttachmentRow[]) {
  const attachmentsByModule = new Map<string, ModuleReflectionAttachmentRow[]>();

  for (const attachment of attachments) {
    attachmentsByModule.set(attachment.module_key, [
      ...(attachmentsByModule.get(attachment.module_key) ?? []),
      attachment,
    ]);
  }

  return attachmentsByModule;
}

async function mapAttachmentPreview(
  attachment: ModuleReflectionAttachmentRow,
  supabase: SupabaseClient<Database>,
): Promise<MentorshipPreparationAttachmentPreview> {
  const signedUrlResult = await StorageRepository.createSignedUrl(
    {
      path: attachment.storage_path,
    },
    supabase,
  ).catch(() => null);

  return {
    createdAt: attachment.created_at,
    id: attachment.id,
    mimeType: attachment.mime_type,
    originalName: attachment.original_name,
    signedUrl: signedUrlResult?.signedUrl ?? null,
    sizeBytes: attachment.size_bytes,
    storagePath: attachment.storage_path,
  };
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
    const attachmentsByModule = groupAttachmentsByModule(attachments);

    const modules = workflow.modules.map((academyModule) => {
      const reflection = reflectionsByModule.get(academyModule.moduleKey);
      const hasReflection = reflection
        ? hasMeaningfulReflection(reflection.content)
        : false;

      return {
        attachmentCount:
          attachmentsByModule.get(academyModule.moduleKey)?.length ?? 0,
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

  async getAdminStudentPreparation(
    input: {
      productId: string;
      profileId: string;
      workflow?: LearningWorkflowEvaluation;
    },
    supabase: SupabaseClient<Database>,
  ): Promise<AdminMentorshipPreparationSummary> {
    const [workflow, reflections, attachments] = await Promise.all([
      input.workflow
        ? Promise.resolve(input.workflow)
        : LearningWorkflowService.evaluateStudentWorkflow(
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
    const attachmentsByModule = groupAttachmentsByModule(attachments);

    const modules = await Promise.all(
      workflow.modules.map(async (academyModule) => {
        const reflection = reflectionsByModule.get(academyModule.moduleKey);
        const moduleAttachments =
          attachmentsByModule.get(academyModule.moduleKey) ?? [];
        const hasReflection = reflection
          ? hasMeaningfulReflection(reflection.content)
          : false;

        return {
          attachmentCount: moduleAttachments.length,
          attachments: await Promise.all(
            moduleAttachments.map((attachment) =>
              mapAttachmentPreview(attachment, supabase),
            ),
          ),
          completed: academyModule.completed,
          hasReflection,
          moduleId: academyModule.moduleId,
          moduleKey: academyModule.moduleKey,
          order: academyModule.order,
          reflectionContent: hasReflection ? reflection?.content ?? null : null,
          reflectionUpdatedAt: hasReflection
            ? reflection?.updated_at ?? null
            : null,
          title: academyModule.title,
        };
      }),
    );
    const pendingItems = [
      ...modules
        .filter((moduleItem) => !moduleItem.completed)
        .map((moduleItem) => `Modulo pendiente: ${moduleItem.title}`),
      ...modules
        .filter((moduleItem) => !moduleItem.hasReflection)
        .map((moduleItem) => `Reflexion pendiente: ${moduleItem.title}`),
      ...workflow.rules
        .filter((rule) => !rule.satisfied)
        .map((rule) => `Requisito pendiente: ${rule.label}`),
    ];
    const missingTradingDays = Math.max(
      workflow.requiredTradingDays - workflow.tradingDays,
      0,
    );

    if (missingTradingDays > 0) {
      pendingItems.push(`Dias de practica faltantes: ${missingTradingDays}`);
    }

    return {
      completedModules: workflow.completedModules,
      completionPercent: workflow.completionPercent,
      moduleReflectionCount: modules.filter(
        (moduleItem) => moduleItem.hasReflection,
      ).length,
      modules,
      pendingItems,
      publishedModules: workflow.publishedModules,
      requiredTradingDays: workflow.requiredTradingDays,
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
