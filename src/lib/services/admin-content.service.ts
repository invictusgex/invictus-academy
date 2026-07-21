import { AdminContentRepository } from "@/lib/repositories/admin-content.repository";
import type {
  AcademyContentProgramRows,
  AcademyModuleContentRow,
  AcademyModuleVideoRow,
  AcademyResourceRow,
} from "@/lib/types/academy-content.types";
import type {
  AdminContentModule,
  AdminContentEditableModuleData,
  AdminContentProgram,
  AdminContentResource,
  AdminContentSummary,
  AdminContentModuleUpdateResult,
  AdminContentModuleValidationError,
  AdminContentVideo,
} from "@/lib/types/admin-content.types";
import {
  adminContentAvailabilityValues,
  adminContentStatusValues,
} from "@/lib/types/admin-content.types";

const titleMaxLength = 160;
const descriptionMaxLength = 500;
const overviewMaxLength = 2000;
const objectiveMaxLength = 180;
const maxObjectiveCount = 20;

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

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeLongText(value: string) {
  return value.trim().replace(/[ \t]+/g, " ");
}

function normalizeObjectives(values: string[]) {
  return values
    .map(normalizeText)
    .filter((objective) => objective.length > 0);
}

function isValidAvailability(
  value: AdminContentEditableModuleData["availability"],
) {
  return adminContentAvailabilityValues.includes(value);
}

function isValidStatus(value: AdminContentEditableModuleData["status"]) {
  return adminContentStatusValues.includes(value);
}

export function validateAdminContentModuleInput(
  input: AdminContentEditableModuleData,
) {
  const errors: AdminContentModuleValidationError[] = [];
  const normalized: AdminContentEditableModuleData = {
    availability: input.availability,
    description: normalizeLongText(input.description),
    estimatedDurationMinutes: input.estimatedDurationMinutes,
    learningObjectives: normalizeObjectives(input.learningObjectives),
    overview: normalizeLongText(input.overview),
    status: input.status,
    title: normalizeText(input.title),
  };

  if (!normalized.title) {
    errors.push({
      field: "title",
      message: "El titulo es obligatorio.",
    });
  } else if (normalized.title.length > titleMaxLength) {
    errors.push({
      field: "title",
      message: `El titulo no puede superar ${titleMaxLength} caracteres.`,
    });
  }

  if (normalized.description.length > descriptionMaxLength) {
    errors.push({
      field: "description",
      message: `La descripcion no puede superar ${descriptionMaxLength} caracteres.`,
    });
  }

  if (normalized.overview.length > overviewMaxLength) {
    errors.push({
      field: "overview",
      message: `El resumen general no puede superar ${overviewMaxLength} caracteres.`,
    });
  }

  if (
    normalized.estimatedDurationMinutes !== null &&
    (!Number.isInteger(normalized.estimatedDurationMinutes) ||
      normalized.estimatedDurationMinutes < 0)
  ) {
    errors.push({
      field: "estimatedDurationMinutes",
      message: "La duracion estimada debe ser un entero no negativo.",
    });
  }

  if (!isValidAvailability(normalized.availability)) {
    errors.push({
      field: "availability",
      message: "La disponibilidad seleccionada no es valida.",
    });
  }

  if (!isValidStatus(normalized.status)) {
    errors.push({
      field: "status",
      message: "El estado seleccionado no es valido.",
    });
  }

  if (normalized.learningObjectives.length > maxObjectiveCount) {
    errors.push({
      field: "learningObjectives",
      message: `No se pueden registrar mas de ${maxObjectiveCount} objetivos.`,
    });
  }

  if (
    normalized.learningObjectives.some(
      (objective) => objective.length > objectiveMaxLength,
    )
  ) {
    errors.push({
      field: "learningObjectives",
      message: `Cada objetivo debe tener ${objectiveMaxLength} caracteres o menos.`,
    });
  }

  return {
    errors,
    normalized,
  };
}

function getNextPublishedAt({
  currentPublishedAt,
  currentStatus,
  nextStatus,
}: {
  currentPublishedAt: string | null;
  currentStatus: AdminContentEditableModuleData["status"];
  nextStatus: AdminContentEditableModuleData["status"];
}) {
  if (nextStatus !== "published") {
    return null;
  }

  if (currentStatus === "published" && currentPublishedAt) {
    return currentPublishedAt;
  }

  return currentPublishedAt ?? new Date().toISOString();
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

  async updateModuleGeneralInfo(
    moduleId: string,
    input: AdminContentEditableModuleData,
  ): Promise<AdminContentModuleUpdateResult> {
    const validation = validateAdminContentModuleInput(input);

    if (validation.errors.length > 0) {
      return {
        errors: validation.errors,
        ok: false,
      };
    }

    try {
      const currentModule = await AdminContentRepository.getModuleContent(moduleId);
      const currentModuleRow = currentModule.modules[0];

      if (!currentModuleRow) {
        return {
          errors: [
            {
              field: "general",
              message: "No fue posible encontrar el modulo solicitado.",
            },
          ],
          ok: false,
        };
      }

      const updatedModuleRow =
        await AdminContentRepository.updateModuleGeneralInfo(moduleId, {
          availability: validation.normalized.availability,
          description: validation.normalized.description,
          estimated_duration_minutes:
            validation.normalized.estimatedDurationMinutes,
          learning_objectives: validation.normalized.learningObjectives,
          overview: validation.normalized.overview,
          published_at: getNextPublishedAt({
            currentPublishedAt: currentModuleRow.published_at,
            currentStatus: currentModuleRow.status,
            nextStatus: validation.normalized.status,
          }),
          status: validation.normalized.status,
          title: validation.normalized.title,
        });

      return {
        module: mapModule({
          moduleRow: updatedModuleRow,
          resources: currentModule.resources,
          videos: currentModule.videos,
        }),
        ok: true,
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible guardar los cambios.",
          },
        ],
        ok: false,
      };
    }
  },
};
