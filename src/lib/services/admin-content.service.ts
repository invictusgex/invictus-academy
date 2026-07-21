import { AdminContentRepository } from "@/lib/repositories/admin-content.repository";
import type {
  AcademyContentProgramRows,
  AcademyModuleContentRow,
  AcademyModuleVideoRow,
  AcademyResourceRow,
} from "@/lib/types/academy-content.types";
import type {
  AdminContentModule,
  AdminContentProgram,
  AdminContentResource,
  AdminContentSummary,
  AdminContentVideo,
} from "@/lib/types/admin-content.types";

function getLearningObjectives(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function mapVideo(row: AcademyModuleVideoRow): AdminContentVideo {
  return {
    durationSeconds: row.duration_seconds,
    id: row.id,
    moduleId: row.module_id,
    position: row.video_order,
    provider: row.provider,
    providerVideoId: row.provider_video_id,
    status: row.status,
    thumbnailUrl: row.thumbnail_url,
    title: row.title,
  };
}

function mapResource(row: AcademyResourceRow): AdminContentResource {
  return {
    description: row.description,
    id: row.id,
    moduleId: row.module_id,
    position: row.resource_order,
    resourceType: row.resource_type,
    status: row.status,
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
}): AdminContentModule {
  const moduleVideos = videos
    .filter((video) => video.module_id === moduleRow.id)
    .map(mapVideo);
  const moduleResources = resources
    .filter((resource) => resource.module_id === moduleRow.id)
    .map(mapResource);

  return {
    availability: moduleRow.availability,
    description: moduleRow.description,
    estimatedDurationMinutes: moduleRow.estimated_duration_minutes,
    id: moduleRow.id,
    learningObjectives: getLearningObjectives(moduleRow.learning_objectives),
    overview: moduleRow.overview,
    position: moduleRow.module_order,
    publishedAt: moduleRow.published_at,
    resourceCount: moduleResources.length,
    resources: moduleResources,
    status: moduleRow.status,
    title: moduleRow.title,
    videoCount: moduleVideos.length,
    videos: moduleVideos,
  };
}

function buildSummary(modules: AdminContentModule[]): AdminContentSummary {
  return {
    archivedModules: modules.filter((academyModule) =>
      academyModule.status === "archived"
    ).length,
    draftModules: modules.filter((academyModule) =>
      academyModule.status === "draft"
    ).length,
    moduleCount: modules.length,
    publishedModules: modules.filter((academyModule) =>
      academyModule.status === "published"
    ).length,
    resourceCount: modules.reduce(
      (total, academyModule) => total + academyModule.resourceCount,
      0,
    ),
    videoCount: modules.reduce(
      (total, academyModule) => total + academyModule.videoCount,
      0,
    ),
  };
}

function mapProgram(rows: AcademyContentProgramRows): AdminContentProgram {
  const modules = rows.modules.map((moduleRow) =>
    mapModule({
      moduleRow,
      resources: rows.resources,
      videos: rows.videos,
    }),
  );

  return {
    modules,
    summary: buildSummary(modules),
  };
}

export const AdminContentService = {
  async getProgramContent(): Promise<AdminContentProgram> {
    const rows = await AdminContentRepository.listProgramContent();

    return mapProgram(rows);
  },

  async getModuleContent(moduleId: string): Promise<AdminContentModule | null> {
    const rows = await AdminContentRepository.getModuleContent(moduleId);
    const program = mapProgram(rows);

    return program.modules[0] ?? null;
  },
};
