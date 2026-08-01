import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type {
  ModuleReflectionRow,
  ModuleReflectionScope,
  ModuleReflectionUpsertInput,
} from "@/lib/types/module-reflection.types";

const reflectionSelect = `
  id,
  profile_id,
  product_id,
  module_key,
  enrollment_id,
  content,
  created_at,
  updated_at
`;

export const ModuleReflectionRepository = {
  async getAvailablePublishedModule(
    input: {
      moduleKey: string;
      productId: string;
    },
    supabase: SupabaseClient<Database>,
  ) {
    const { data, error } = await supabase
      .from("academy_modules")
      .select("id, module_key, product_id")
      .eq("product_id", input.productId)
      .eq("module_key", input.moduleKey)
      .eq("status", "published")
      .eq("availability", "available")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async getByScope(
    scope: ModuleReflectionScope,
    supabase: SupabaseClient<Database>,
  ): Promise<ModuleReflectionRow | null> {
    const { data, error } = await supabase
      .from("academy_module_reflections")
      .select(reflectionSelect)
      .eq("profile_id", scope.profileId)
      .eq("product_id", scope.productId)
      .eq("module_key", scope.moduleKey)
      .eq("enrollment_id", scope.enrollmentId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as unknown as ModuleReflectionRow | null;
  },

  async upsertReflection(
    input: ModuleReflectionUpsertInput,
    supabase: SupabaseClient<Database>,
  ): Promise<ModuleReflectionRow> {
    const { data, error } = await supabase
      .from("academy_module_reflections")
      .upsert(
        {
          content: input.content,
          enrollment_id: input.enrollmentId,
          module_key: input.moduleKey,
          product_id: input.productId,
          profile_id: input.profileId,
        },
        {
          onConflict: "profile_id,product_id,module_key,enrollment_id",
        },
      )
      .select(reflectionSelect)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as ModuleReflectionRow;
  },
};
