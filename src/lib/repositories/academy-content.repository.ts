import {
  getSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/database/client";
import type {
  AcademyContentProgramRows,
  AcademyModuleContentRow,
  AcademyModuleVideoRow,
  AcademyResourceRow,
} from "@/lib/types/academy-content.types";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
};

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
  thumbnail_url,
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

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured for academy content.");
  }
}

export const AcademyContentRepository = {
  async getProductBySlug(slug: string): Promise<ProductRow | null> {
    ensureSupabaseConfigured();

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, title, description")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as ProductRow | null) ?? null;
  },

  async listProgramContent(
    productSlug: string,
  ): Promise<AcademyContentProgramRows | null> {
    const product = await AcademyContentRepository.getProductBySlug(productSlug);

    if (!product) {
      return null;
    }

    const supabase = getSupabaseClient();
    const { data: modules, error: modulesError } = await supabase
      .from("academy_modules")
      .select(moduleSelect)
      .eq("product_id", product.id)
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
    productSlug: string,
    moduleKey: string,
  ): Promise<AcademyContentProgramRows | null> {
    const programContent =
      await AcademyContentRepository.listProgramContent(productSlug);

    if (!programContent) {
      return null;
    }

    const academyModule = programContent.modules.find(
      (moduleRow) => moduleRow.module_key === moduleKey,
    );

    if (!academyModule) {
      return {
        modules: [],
        resources: [],
        videos: [],
      };
    }

    return {
      modules: [academyModule],
      resources: programContent.resources.filter(
        (resource) => resource.module_id === academyModule.id,
      ),
      videos: programContent.videos.filter(
        (video) => video.module_id === academyModule.id,
      ),
    };
  },
};
