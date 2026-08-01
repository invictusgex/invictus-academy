import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type {
  ModuleReflectionAttachmentRow,
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

const attachmentSelect = `
  id,
  reflection_id,
  profile_id,
  product_id,
  module_key,
  enrollment_id,
  storage_path,
  original_name,
  mime_type,
  size_bytes,
  created_at
`;

type AttachmentInsertInput = ModuleReflectionScope & {
  mimeType: string;
  originalName: string;
  reflectionId: string;
  sizeBytes: number;
  storagePath: string;
};

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

  async countAttachmentsByReflection(
    reflectionId: string,
    supabase: SupabaseClient<Database>,
  ): Promise<number> {
    const { count, error } = await supabase
      .from("academy_module_reflection_attachments")
      .select("id", { count: "exact", head: true })
      .eq("reflection_id", reflectionId);

    if (error) {
      throw error;
    }

    return count ?? 0;
  },

  async listAttachmentsByReflection(
    reflectionId: string,
    supabase: SupabaseClient<Database>,
  ): Promise<ModuleReflectionAttachmentRow[]> {
    const { data, error } = await supabase
      .from("academy_module_reflection_attachments")
      .select(attachmentSelect)
      .eq("reflection_id", reflectionId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (data as unknown as ModuleReflectionAttachmentRow[] | null) ?? [];
  },

  async createAttachment(
    input: AttachmentInsertInput,
    supabase: SupabaseClient<Database>,
  ): Promise<ModuleReflectionAttachmentRow> {
    const { data, error } = await supabase
      .from("academy_module_reflection_attachments")
      .insert({
        enrollment_id: input.enrollmentId,
        mime_type: input.mimeType,
        module_key: input.moduleKey,
        original_name: input.originalName,
        product_id: input.productId,
        profile_id: input.profileId,
        reflection_id: input.reflectionId,
        size_bytes: input.sizeBytes,
        storage_path: input.storagePath,
      })
      .select(attachmentSelect)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as ModuleReflectionAttachmentRow;
  },

  async getAttachmentById(
    input: {
      attachmentId: string;
      profileId: string;
    },
    supabase: SupabaseClient<Database>,
  ): Promise<ModuleReflectionAttachmentRow | null> {
    const { data, error } = await supabase
      .from("academy_module_reflection_attachments")
      .select(attachmentSelect)
      .eq("id", input.attachmentId)
      .eq("profile_id", input.profileId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as unknown as ModuleReflectionAttachmentRow | null;
  },

  async deleteAttachmentById(
    input: {
      attachmentId: string;
      profileId: string;
    },
    supabase: SupabaseClient<Database>,
  ): Promise<void> {
    const { error } = await supabase
      .from("academy_module_reflection_attachments")
      .delete()
      .eq("id", input.attachmentId)
      .eq("profile_id", input.profileId);

    if (error) {
      throw error;
    }
  },
};
