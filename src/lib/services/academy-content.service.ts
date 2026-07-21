import { academyProgram as fallbackAcademyProgram } from "@/content/programs/trading-basado-en-datos/program";
import { AcademyContentRepository } from "@/lib/repositories/academy-content.repository";
import type {
  AcademyContentProgramRows,
  AcademyModuleContentRow,
  AcademyModuleVideoRow,
  AcademyResourceRow,
} from "@/lib/types/academy-content.types";
import type { Course, Module, ModuleResource, ModuleVideo } from "@/types/academy";

const academyProductSlug = "trading-basado-en-datos";

function getLearningObjectives(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function mapVideo(row: AcademyModuleVideoRow): ModuleVideo {
  return {
    description: row.description,
    durationSeconds: row.duration_seconds,
    id: row.video_key,
    placeholder: row.placeholder,
    provider: row.provider,
    providerVideoId: row.provider_video_id,
    status: row.status,
    thumbnailUrl: row.thumbnail_url,
    title: row.title,
  };
}

function mapResource(row: AcademyResourceRow): ModuleResource {
  return {
    description: row.description,
    id: row.resource_key,
    resourceType: row.resource_type,
    status: row.status,
    storagePath: row.storage_path,
    title: row.title,
    url: row.url,
  };
}

function mapModule({
  moduleRow,
  resources,
  videos,
}: {
  moduleRow: AcademyModuleContentRow;
  resources: AcademyResourceRow[];
  videos: AcademyModuleVideoRow[];
}): Module {
  return {
    availability: moduleRow.availability,
    createdAt: moduleRow.created_at,
    description: moduleRow.description,
    estimatedDurationMinutes: moduleRow.estimated_duration_minutes,
    id: moduleRow.module_key,
    learningObjectives: getLearningObjectives(moduleRow.learning_objectives),
    number: moduleRow.module_order,
    overview: moduleRow.overview,
    resources: resources
      .filter((resource) => resource.module_id === moduleRow.id)
      .map(mapResource),
    status: moduleRow.status,
    title: moduleRow.title,
    updatedAt: moduleRow.updated_at,
    videos: videos
      .filter((video) => video.module_id === moduleRow.id)
      .map(mapVideo),
  };
}

function mapProgram(rows: AcademyContentProgramRows): Course {
  return {
    ...fallbackAcademyProgram,
    modules: rows.modules.map((moduleRow) =>
      mapModule({
        moduleRow,
        resources: rows.resources,
        videos: rows.videos,
      }),
    ),
  };
}

function shouldUseFallback(rows: AcademyContentProgramRows | null) {
  return !rows || rows.modules.length === 0;
}

export const AcademyContentService = {
  async getProgram(productSlug = academyProductSlug): Promise<Course> {
    try {
      const rows = await AcademyContentRepository.listProgramContent(productSlug);

      if (!rows || shouldUseFallback(rows)) {
        return fallbackAcademyProgram;
      }

      return mapProgram(rows);
    } catch {
      return fallbackAcademyProgram;
    }
  },

  async getModules(productSlug = academyProductSlug): Promise<Module[]> {
    const program = await AcademyContentService.getProgram(productSlug);

    return program.modules;
  },

  async getModule(
    moduleKey: string,
    productSlug = academyProductSlug,
  ): Promise<Module | undefined> {
    try {
      const rows = await AcademyContentRepository.getModuleContent(
        productSlug,
        moduleKey,
      );

      if (!rows || rows.modules.length === 0) {
        return fallbackAcademyProgram.modules.find(
          (academyModule) => academyModule.id === moduleKey,
        );
      }

      return mapModule({
        moduleRow: rows.modules[0],
        resources: rows.resources,
        videos: rows.videos,
      });
    } catch {
      return fallbackAcademyProgram.modules.find(
        (academyModule) => academyModule.id === moduleKey,
      );
    }
  },

  async getModuleVideos(
    moduleKey: string,
    productSlug = academyProductSlug,
  ): Promise<ModuleVideo[]> {
    const academyModule = await AcademyContentService.getModule(
      moduleKey,
      productSlug,
    );

    return academyModule?.videos ?? [];
  },

  async getModuleResources(
    moduleKey: string,
    productSlug = academyProductSlug,
  ): Promise<ModuleResource[]> {
    const academyModule = await AcademyContentService.getModule(
      moduleKey,
      productSlug,
    );

    return academyModule?.resources ?? [];
  },
};
