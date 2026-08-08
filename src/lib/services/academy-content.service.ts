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
const placeholderDescriptionPatterns = [
  "contenido pendiente de definicion",
  "contenido pendiente de definición",
  "pendiente de definicion",
  "pendiente de definición",
  "en este módulo desarrollarás los conceptos fundamentales correspondientes a esta etapa del programa.",
];

function getLearningObjectives(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function getFallbackVideoObjective(videoKey: string) {
  for (const academyModule of fallbackAcademyProgram.modules) {
    const fallbackVideo = academyModule.videos.find(
      (video) => video.id === videoKey,
    );

    if (fallbackVideo?.objective) {
      return fallbackVideo.objective;
    }
  }

  return undefined;
}

function normalizeCopy(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isPlaceholderDescription(value: string | null | undefined) {
  if (!value) {
    return true;
  }

  const normalizedValue = normalizeCopy(value);

  return placeholderDescriptionPatterns.some(
    (pattern) => normalizedValue === normalizeCopy(pattern),
  );
}

function getFallbackModule(moduleKey: string) {
  return fallbackAcademyProgram.modules.find(
    (academyModule) => academyModule.id === moduleKey,
  );
}

function getAcademicModuleDescription(moduleKey: string) {
  const fallbackModule = getFallbackModule(moduleKey);

  return (
    fallbackModule?.videos
      .map((video) => video.objective)
      .filter((objective): objective is string => Boolean(objective?.trim()))
      .join(" ") || fallbackModule?.overview
  );
}

function resolveModuleDescription(
  moduleKey: string,
  description: string | null | undefined,
) {
  if (!isPlaceholderDescription(description)) {
    return description ?? "";
  }

  return getAcademicModuleDescription(moduleKey) ?? description ?? "";
}

function resolveModuleOverview(moduleKey: string, overview: string) {
  if (!isPlaceholderDescription(overview)) {
    return overview;
  }

  return getAcademicModuleDescription(moduleKey) ?? overview;
}

function sanitizeModule(academyModule: Module): Module {
  return {
    ...academyModule,
    description: resolveModuleDescription(
      academyModule.id,
      academyModule.description,
    ),
    overview: resolveModuleOverview(academyModule.id, academyModule.overview),
  };
}

function sanitizeProgram(program: Course): Course {
  return {
    ...program,
    modules: program.modules.map(sanitizeModule),
  };
}

function mapVideo(row: AcademyModuleVideoRow): ModuleVideo {
  return {
    description: row.description,
    durationSeconds: row.duration_seconds,
    id: row.video_key,
    objective: getFallbackVideoObjective(row.video_key),
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
    description: resolveModuleDescription(
      moduleRow.module_key,
      moduleRow.description,
    ),
    estimatedDurationMinutes: moduleRow.estimated_duration_minutes,
    id: moduleRow.module_key,
    learningObjectives: getLearningObjectives(moduleRow.learning_objectives),
    number: moduleRow.module_order,
    overview: resolveModuleOverview(moduleRow.module_key, moduleRow.overview),
    resources: resources
      .filter((resource) => resource.module_id === moduleRow.id)
      .map(mapResource),
    status: moduleRow.status,
    thumbnailUrl: moduleRow.thumbnail_url,
    title: moduleRow.title,
    updatedAt: moduleRow.updated_at,
    videos: videos
      .filter((video) => video.module_id === moduleRow.id)
      .map(mapVideo),
  };
}

function mapProgram(rows: AcademyContentProgramRows): Course {
  return {
    ...sanitizeProgram(fallbackAcademyProgram),
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
        return sanitizeProgram(fallbackAcademyProgram);
      }

      return mapProgram(rows);
    } catch {
      return sanitizeProgram(fallbackAcademyProgram);
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
        return sanitizeProgram(fallbackAcademyProgram).modules.find(
          (academyModule) => academyModule.id === moduleKey,
        );
      }

      return mapModule({
        moduleRow: rows.modules[0],
        resources: rows.resources,
        videos: rows.videos,
      });
    } catch {
      return sanitizeProgram(fallbackAcademyProgram).modules.find(
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
