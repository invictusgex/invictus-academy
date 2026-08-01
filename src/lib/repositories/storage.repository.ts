import { getSupabaseClient } from "@/lib/database/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  StorageDeleteInput,
  StorageReplaceInput,
  StorageSignedUrlInput,
  StorageSignedUrlResult,
  StorageUploadInput,
} from "@/lib/types/storage.types";
import {
  academyAssetsBucket,
  defaultSignedUrlDurationSeconds,
} from "@/lib/types/storage.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const StorageRepository = {
  async uploadFile(
    input: StorageUploadInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(academyAssetsBucket)
      .upload(input.path, input.file, {
        contentType: input.contentType,
        upsert: input.upsert ?? false,
      });

    if (error) {
      throw error;
    }

    return data.path;
  },

  async deleteFile(
    input: StorageDeleteInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<void> {
    const { error } = await supabase.storage
      .from(academyAssetsBucket)
      .remove([input.path]);

    if (error) {
      throw error;
    }
  },

  async replaceFile(
    input: StorageReplaceInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<string> {
    return StorageRepository.uploadFile({
      contentType: input.contentType,
      file: input.file,
      path: input.path,
      upsert: true,
    }, supabase);
  },

  async createSignedUrl(
    input: StorageSignedUrlInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<StorageSignedUrlResult> {
    const expiresInSeconds =
      input.expiresInSeconds ?? defaultSignedUrlDurationSeconds;
    const { data, error } = await supabase.storage
      .from(academyAssetsBucket)
      .createSignedUrl(input.path, expiresInSeconds);

    if (error) {
      throw error;
    }

    return {
      expiresAt: new Date(
        Date.now() + expiresInSeconds * 1000,
      ),
      expiresInSeconds,
      path: input.path,
      signedUrl: data.signedUrl,
    };
  },
};
