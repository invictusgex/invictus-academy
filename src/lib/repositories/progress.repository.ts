import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  ModuleProgressRow,
  ModuleProgressUpsertInput,
  ProductReference,
} from "@/lib/types/progress.types";

type ProductRow = {
  id: string;
  slug: string;
};

type MarkModuleCompletedInput = {
  moduleKey: string;
  productSlug: string;
};

const moduleProgressSelect = `
  id,
  profile_id,
  product_id,
  module_key,
  status,
  progress_percent,
  started_at,
  completed_at,
  last_seen_at,
  created_at,
  updated_at
`;

function toUpsertRow(input: ModuleProgressUpsertInput) {
  return {
    profile_id: input.profileId,
    product_id: input.productId,
    module_key: input.moduleKey,
    status: input.status,
    progress_percent: input.progressPercent,
    started_at: input.startedAt,
    completed_at: input.completedAt,
    last_seen_at: input.lastSeenAt,
  };
}

export const ProgressRepository = {
  async getProductBySlug(
    slug: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<ProductReference | null> {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const product = data as ProductRow | null;

    return product ? { id: product.id, slug: product.slug } : null;
  },

  async listByProfileAndProduct(
    profileId: string,
    productId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<ModuleProgressRow[]> {
    const { data, error } = await supabase
      .from("module_progress")
      .select(moduleProgressSelect)
      .eq("profile_id", profileId)
      .eq("product_id", productId);

    if (error) {
      throw error;
    }

    return (data as unknown as ModuleProgressRow[] | null) ?? [];
  },

  async upsertModuleProgress(
    input: ModuleProgressUpsertInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<ModuleProgressRow> {
    const { data, error } = await supabase
      .from("module_progress")
      .upsert(toUpsertRow(input), {
        onConflict: "profile_id,product_id,module_key",
      })
      .select(moduleProgressSelect)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as ModuleProgressRow;
  },

  async markModuleCompleted(
    input: MarkModuleCompletedInput,
    supabase: SupabaseClient<Database>,
  ): Promise<ModuleProgressRow> {
    const { data, error } = await supabase.rpc("mark_module_completed", {
      p_module_key: input.moduleKey,
      p_product_slug: input.productSlug,
    });

    if (error) {
      throw error;
    }

    return data as ModuleProgressRow;
  },
};
