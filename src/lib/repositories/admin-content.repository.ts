import { getSupabaseClient } from "@/lib/database/client";
import type {
  AcademyContentProgramRows,
  AcademyModuleContentRow,
  AcademyModuleVideoRow,
  AcademyResourceRow,
} from "@/lib/types/academy-content.types";
import type {
  AdminContentEditableModuleData,
} from "@/lib/types/admin-content.types";

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
};
