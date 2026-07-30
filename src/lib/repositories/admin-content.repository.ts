import { getSupabaseClient } from "@/lib/database/client";
import type {
  AcademyContentProgramRows,
  AcademyModuleContentRow,
  AcademyModuleVideoRow,
  AcademyResourceRow,
} from "@/lib/types/academy-content.types";
import type {
  AdminContentEditableModuleData,
  AdminContentEditableResourceData,
  AdminContentEditableVideoData,
} from "@/lib/types/admin-content.types";
import type { AcademyResourceType } from "@/types/academy";

const moduleSelect = `
  id,
  product_id,
  module_key,
  module_order,
  title,
  description,
  overview,
  learning_objectives,
  estimated_duration_minutes,
  availability,
  status,
  published_at,
  created_at,
  updated_at
`;

const videoSelect = `
  id,
  module_id,
  video_key,
  video_order,
  title,
  description,
  provider,
  provider_video_id,
  duration_seconds,
  thumbnail_url,
  placeholder,
  status,
  published_at,
  created_at,
  updated_at
`;

const resourceSelect = `
  id,
  module_id,
  resource_key,
  resource_order,
  title,
  description,
  resource_type,
  url,
  storage_path,
  metadata,
  status,
  published_at,
  created_at,
  updated_at
`;

type AcademyModuleUpdateRow = {
  availability: AdminContentEditableModuleData["availability"];
  description: string;
  estimated_duration_minutes: number | null;
  learning_objectives: string[];
  overview: string;
  published_at: string | null;
  status: AdminContentEditableModuleData["status"];
  title: string;
};

type AcademyModuleVideoCreateRow = {
  duration_seconds: number | null;
  module_id: string;
  provider: AdminContentEditableVideoData["provider"];
  provider_video_id: string;
  published_at: string | null;
  status: AdminContentEditableVideoData["status"];
  thumbnail_url: string | null;
  title: string;
  video_key: string;
  video_order: number;
};

type AcademyModuleVideoUpdateRow = {
  duration_seconds: number | null;
  provider: AdminContentEditableVideoData["provider"];
  provider_video_id: string;
  published_at: string | null;
  status: AdminContentEditableVideoData["status"];
  thumbnail_url: string | null;
  title: string;
};

type AcademyModuleVideoPositionUpdate = {
  id: string;
  videoOrder: number;
};

type AcademyResourceCreateRow = {
  description: string;
  metadata: Record<string, never>;
  module_id: string;
  published_at: string | null;
  resource_key: string;
  resource_order: number;
  resource_type: AcademyResourceType;
  status: AdminContentEditableResourceData["status"];
  storage_path: string | null;
  title: string;
  url: string | null;
};

type AcademyResourceUpdateRow = {
  description: string;
  metadata: Record<string, never>;
  published_at: string | null;
  resource_type: AcademyResourceType;
  status: AdminContentEditableResourceData["status"];
  storage_path: string | null;
  title: string;
  url: string | null;
};

type AcademyResourcePositionUpdate = {
  id: string;
  resourceOrder: number;
};

export const AdminContentRepository = {
  async listProgramContent(): Promise<AcademyContentProgramRows> {
    const supabase = getSupabaseClient();
    const { data: modules, error: modulesError } = await supabase
      .from("academy_modules")
      .select(moduleSelect)
      .order("module_order", { ascending: true });

    if (modulesError) {
      throw modulesError;
    }

    const moduleRows = (modules as unknown as AcademyModuleContentRow[] | null) ?? [];
    const moduleIds = moduleRows.map((academyModule) => academyModule.id);

    if (moduleIds.length === 0) {
      return {
        modules: [],
        resources: [],
        videos: [],
      };
    }

    const [videosResult, resourcesResult] = await Promise.all([
      supabase
        .from("academy_module_videos")
        .select(videoSelect)
        .in("module_id", moduleIds)
        .order("video_order", { ascending: true }),
      supabase
        .from("academy_resources")
        .select(resourceSelect)
        .in("module_id", moduleIds)
        .order("resource_order", { ascending: true }),
    ]);

    if (videosResult.error) {
      throw videosResult.error;
    }

    if (resourcesResult.error) {
      throw resourcesResult.error;
    }

    return {
      modules: moduleRows,
      resources:
        (resourcesResult.data as unknown as AcademyResourceRow[] | null) ?? [],
      videos: (videosResult.data as unknown as AcademyModuleVideoRow[] | null) ?? [],
    };
  },

  async getModuleContent(
    moduleId: string,
  ): Promise<AcademyContentProgramRows> {
    const supabase = getSupabaseClient();
    const { data: moduleData, error: moduleError } = await supabase
      .from("academy_modules")
      .select(moduleSelect)
      .eq("id", moduleId)
      .maybeSingle();

    if (moduleError) {
      throw moduleError;
    }

    const moduleRow = moduleData as unknown as AcademyModuleContentRow | null;

    if (!moduleRow) {
      return {
        modules: [],
        resources: [],
        videos: [],
      };
    }

    const [videosResult, resourcesResult] = await Promise.all([
      supabase
        .from("academy_module_videos")
        .select(videoSelect)
        .eq("module_id", moduleRow.id)
        .order("video_order", { ascending: true }),
      supabase
        .from("academy_resources")
        .select(resourceSelect)
        .eq("module_id", moduleRow.id)
        .order("resource_order", { ascending: true }),
    ]);

    if (videosResult.error) {
      throw videosResult.error;
    }

    if (resourcesResult.error) {
      throw resourcesResult.error;
    }

    return {
      modules: [moduleRow],
      resources:
        (resourcesResult.data as unknown as AcademyResourceRow[] | null) ?? [],
      videos: (videosResult.data as unknown as AcademyModuleVideoRow[] | null) ?? [],
    };
  },

  async updateModuleGeneralInfo(
    moduleId: string,
    input: AcademyModuleUpdateRow,
  ): Promise<AcademyModuleContentRow> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("academy_modules")
      .update(input)
      .eq("id", moduleId)
      .select(moduleSelect)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as AcademyModuleContentRow;
  },

  async listModuleVideos(moduleId: string): Promise<AcademyModuleVideoRow[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("academy_module_videos")
      .select(videoSelect)
      .eq("module_id", moduleId)
      .order("video_order", { ascending: true });

    if (error) {
      throw error;
    }

    return (data as unknown as AcademyModuleVideoRow[] | null) ?? [];
  },

  async createVideo(
    input: AcademyModuleVideoCreateRow,
  ): Promise<AcademyModuleVideoRow> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("academy_module_videos")
      .insert(input)
      .select(videoSelect)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as AcademyModuleVideoRow;
  },

  async updateVideo(
    videoId: string,
    input: AcademyModuleVideoUpdateRow,
  ): Promise<AcademyModuleVideoRow> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("academy_module_videos")
      .update(input)
      .eq("id", videoId)
      .select(videoSelect)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as AcademyModuleVideoRow;
  },

  async deleteVideo(videoId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("academy_module_videos")
      .delete()
      .eq("id", videoId);

    if (error) {
      throw error;
    }
  },

  async updateVideoPositions(
    updates: AcademyModuleVideoPositionUpdate[],
  ): Promise<void> {
    if (updates.length === 0) {
      return;
    }

    const supabase = getSupabaseClient();
    const tempBase =
      Math.max(...updates.map((update) => update.videoOrder)) + 1000;

    for (const [index, update] of updates.entries()) {
      const { error } = await supabase
        .from("academy_module_videos")
        .update({ video_order: tempBase + index })
        .eq("id", update.id);

      if (error) {
        throw error;
      }
    }

    for (const update of updates) {
      const { error } = await supabase
        .from("academy_module_videos")
        .update({ video_order: update.videoOrder })
        .eq("id", update.id);

      if (error) {
        throw error;
      }
    }
  },

  async createResource(
    input: AcademyResourceCreateRow,
  ): Promise<AcademyResourceRow> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("academy_resources")
      .insert(input)
      .select(resourceSelect)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as AcademyResourceRow;
  },

  async updateResource(
    resourceId: string,
    input: AcademyResourceUpdateRow,
  ): Promise<AcademyResourceRow> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("academy_resources")
      .update(input)
      .eq("id", resourceId)
      .select(resourceSelect)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as AcademyResourceRow;
  },

  async deleteResource(resourceId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("academy_resources")
      .delete()
      .eq("id", resourceId);

    if (error) {
      throw error;
    }
  },

  async reorderResources(
    updates: AcademyResourcePositionUpdate[],
  ): Promise<void> {
    if (updates.length === 0) {
      return;
    }

    const supabase = getSupabaseClient();
    const tempBase =
      Math.max(...updates.map((update) => update.resourceOrder)) + 1000;

    for (const [index, update] of updates.entries()) {
      const { error } = await supabase
        .from("academy_resources")
        .update({ resource_order: tempBase + index })
        .eq("id", update.id);

      if (error) {
        throw error;
      }
    }

    for (const update of updates) {
      const { error } = await supabase
        .from("academy_resources")
        .update({ resource_order: update.resourceOrder })
        .eq("id", update.id);

      if (error) {
        throw error;
      }
    }
  },
};
