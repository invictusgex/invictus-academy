import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  LearningWorkflowEnrollmentRow,
  LearningWorkflowModuleRow,
  LearningWorkflowProgressRow,
} from "@/lib/types/learning-workflow.types";

type LearningWorkflowReadInput = {
  productId: string;
  profileId: string;
};

const moduleSelect = `
  id,
  module_key,
  module_order,
  title
`;

const progressSelect = `
  module_key,
  status,
  progress_percent,
  completed_at
`;

export const LearningWorkflowRepository = {
  /**
   * Reads the enrollment row for one student/product pair.
   */
  async getEnrollment(
    input: LearningWorkflowReadInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<LearningWorkflowEnrollmentRow | null> {
    const { data, error } = await supabase
      .from("enrollments")
      .select(
        "id, profile_id, product_id, status, starts_at, expires_at, revoked_at",
      )
      .eq("profile_id", input.profileId)
      .eq("product_id", input.productId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as LearningWorkflowEnrollmentRow | null) ?? null;
  },

  /**
   * Lists published, available modules that count toward student completion.
   */
  async listPublishedModules(
    productId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<LearningWorkflowModuleRow[]> {
    const { data, error } = await supabase
      .from("academy_modules")
      .select(moduleSelect)
      .eq("product_id", productId)
      .eq("status", "published")
      .eq("availability", "available")
      .order("module_order", { ascending: true });

    if (error) {
      throw error;
    }

    return (data as LearningWorkflowModuleRow[] | null) ?? [];
  },

  /**
   * Lists persisted module progress for one student/product pair.
   */
  async listModuleProgress(
    input: LearningWorkflowReadInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<LearningWorkflowProgressRow[]> {
    const { data, error } = await supabase
      .from("module_progress")
      .select(progressSelect)
      .eq("profile_id", input.profileId)
      .eq("product_id", input.productId);

    if (error) {
      throw error;
    }

    return (data as LearningWorkflowProgressRow[] | null) ?? [];
  },
};
