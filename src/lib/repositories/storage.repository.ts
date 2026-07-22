import { getSupabaseClient } from "@/lib/database/client";
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

export const StorageRepository = {
  async uploadFile(input: StorageUploadInput): Promise<string> {
    const supabase = getSupabaseClient();
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

  async deleteFile(input: StorageDeleteInput): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from(academyAssetsBucket)
      .remove([input.path]);

    if (error) {
      throw error;
    }
  },

  async replaceFile(input: StorageReplaceInput): Promise<string> {
    return StorageRepository.uploadFile({
      contentType: input.contentType,
      file: input.file,
      path: input.path,
      upsert: true,
    });
  },

  async createSignedUrl(
    input: StorageSignedUrlInput,
  ): Promise<StorageSignedUrlResult> {
    const supabase = getSupabaseClient();
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
