import { AdminContentRepository } from "@/lib/repositories/admin-content.repository";
import { StorageService } from "@/lib/services/storage.service";
import type {
  AcademyContentProgramRows,
  AcademyModuleContentRow,
  AcademyModuleVideoRow,
  AcademyResourceRow,
} from "@/lib/types/academy-content.types";
import type {
  AdminContentModule,
  AdminContentEditableModuleData,
  AdminContentEditableResourceData,
  AdminContentEditableVideoData,
  AdminContentProgram,
  AdminContentResource,
  AdminContentResourceMutationResult,
  AdminContentResourceValidationError,
  AdminContentSummary,
  AdminContentModuleUpdateResult,
  AdminContentModuleValidationError,
  AdminContentVideoMutationResult,
  AdminContentVideoProvider,
  AdminContentVideoValidationError,
  AdminContentVideo,
} from "@/lib/types/admin-content.types";
import {
  adminContentAvailabilityValues,
  adminContentResourceTypeValues,
  adminContentStatusValues,
  adminContentVideoProviderValues,
} from "@/lib/types/admin-content.types";

const titleMaxLength = 160;
const descriptionMaxLength = 500;
const overviewMaxLength = 2000;
const objectiveMaxLength = 180;
const maxObjectiveCount = 20;
const moduleThumbnailUrlMaxLength = 500;
const videoTitleMaxLength = 160;
const videoProviderIdMaxLength = 300;
const videoThumbnailUrlMaxLength = 500;
const resourceTitleMaxLength = 160;
const resourceDescriptionMaxLength = 500;
const resourceUrlMaxLength = 500;
const resourceStoragePathMaxLength = 500;

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
    provider: isValidVideoProvider(row.provider) ? row.provider : null,
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
    thumbnailUrl: moduleRow.thumbnail_url,
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

function isValidVideoProvider(
  value: AdminContentVideoProvider | string | null,
): value is AdminContentVideoProvider {
  if (!value) {
    return false;
  }

  return adminContentVideoProviderValues.includes(
    value as AdminContentVideoProvider,
  );
}

function isValidResourceType(
  value: AdminContentEditableResourceData["resourceType"],
) {
  return adminContentResourceTypeValues.includes(value);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function hasUnsafeMarkupCharacters(value: string) {
  return /[<>]/.test(value);
}

function getAllowedResourceStorageKinds(
  resourceType: AdminContentEditableResourceData["resourceType"],
) {
  return resourceType === "pdf"
    ? (["resource_pdf"] as const)
    : (["resource_pdf", "resource_doc", "resource_image"] as const);
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
    thumbnailUrl: normalizeText(input.thumbnailUrl),
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

  if (normalized.thumbnailUrl.length > moduleThumbnailUrlMaxLength) {
    errors.push({
      field: "thumbnailUrl",
      message: `La miniatura no puede superar ${moduleThumbnailUrlMaxLength} caracteres.`,
    });
  } else if (
    normalized.thumbnailUrl &&
    !StorageService.isExternalAssetUrl(normalized.thumbnailUrl) &&
    !StorageService.validatePathForAssetKind(
      normalized.thumbnailUrl,
      "module_thumbnail",
    )
  ) {
    errors.push({
      field: "thumbnailUrl",
      message: "La miniatura debe ser una URL heredada o una ruta interna valida.",
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

function getNextVideoPublishedAt({
  currentPublishedAt,
  currentStatus,
  nextStatus,
}: {
  currentPublishedAt: string | null;
  currentStatus: AdminContentEditableVideoData["status"];
  nextStatus: AdminContentEditableVideoData["status"];
}) {
  if (nextStatus !== "published") {
    return null;
  }

  if (currentStatus === "published" && currentPublishedAt) {
    return currentPublishedAt;
  }

  return currentPublishedAt ?? new Date().toISOString();
}

function getNextResourcePublishedAt({
  currentPublishedAt,
  currentStatus,
  nextStatus,
}: {
  currentPublishedAt: string | null;
  currentStatus: AdminContentEditableResourceData["status"];
  nextStatus: AdminContentEditableResourceData["status"];
}) {
  if (nextStatus !== "published") {
    return null;
  }

  if (currentStatus === "published" && currentPublishedAt) {
    return currentPublishedAt;
  }

  return currentPublishedAt ?? new Date().toISOString();
}

function validateAdminContentVideoInput(
  input: AdminContentEditableVideoData,
  options: { requirePosition: boolean },
) {
  const errors: AdminContentVideoValidationError[] = [];
  const normalized: AdminContentEditableVideoData = {
    durationSeconds: input.durationSeconds,
    position: input.position,
    provider: input.provider,
    providerVideoId: normalizeText(input.providerVideoId),
    status: input.status,
    thumbnailUrl: normalizeText(input.thumbnailUrl),
    title: normalizeText(input.title),
  };

  if (!normalized.title) {
    errors.push({
      field: "title",
      message: "El titulo es obligatorio.",
    });
  } else if (normalized.title.length > videoTitleMaxLength) {
    errors.push({
      field: "title",
      message: `El titulo no puede superar ${videoTitleMaxLength} caracteres.`,
    });
  }

  if (!isValidVideoProvider(normalized.provider)) {
    errors.push({
      field: "provider",
      message: "El proveedor seleccionado no es valido.",
    });
  }

  if (!normalized.providerVideoId) {
    errors.push({
      field: "providerVideoId",
      message: "El identificador o URL del video es obligatorio.",
    });
  } else if (normalized.providerVideoId.length > videoProviderIdMaxLength) {
    errors.push({
      field: "providerVideoId",
      message: `El identificador o URL no puede superar ${videoProviderIdMaxLength} caracteres.`,
    });
  } else if (
    normalized.provider === "external" &&
    !isValidUrl(normalized.providerVideoId)
  ) {
    errors.push({
      field: "providerVideoId",
      message: "El proveedor external requiere una URL http o https valida.",
    });
  } else if (/[<>]/.test(normalized.providerVideoId)) {
    errors.push({
      field: "providerVideoId",
      message: "El identificador o URL contiene caracteres no permitidos.",
    });
  }

  if (
    normalized.durationSeconds !== null &&
    (!Number.isInteger(normalized.durationSeconds) ||
      normalized.durationSeconds < 0)
  ) {
    errors.push({
      field: "durationSeconds",
      message: "La duracion debe ser un entero no negativo.",
    });
  }

  if (options.requirePosition && normalized.position === null) {
    errors.push({
      field: "position",
      message: "La posicion es obligatoria.",
    });
  }

  if (
    normalized.position !== null &&
    (!Number.isInteger(normalized.position) || normalized.position <= 0)
  ) {
    errors.push({
      field: "position",
      message: "La posicion debe ser un entero mayor que cero.",
    });
  }

  if (!isValidStatus(normalized.status)) {
    errors.push({
      field: "status",
      message: "El estado seleccionado no es valido.",
    });
  }

  if (normalized.thumbnailUrl.length > videoThumbnailUrlMaxLength) {
    errors.push({
      field: "thumbnailUrl",
      message: `La URL de miniatura no puede superar ${videoThumbnailUrlMaxLength} caracteres.`,
    });
  } else if (
    normalized.thumbnailUrl.length > 0 &&
    !isValidUrl(normalized.thumbnailUrl)
  ) {
    errors.push({
      field: "thumbnailUrl",
      message: "La miniatura debe ser una URL http o https valida.",
    });
  }

  return {
    errors,
    normalized,
  };
}

function validateAdminContentResourceInput(
  input: AdminContentEditableResourceData,
  options: { requirePosition: boolean },
) {
  const errors: AdminContentResourceValidationError[] = [];
  const normalized: AdminContentEditableResourceData = {
    description: normalizeLongText(input.description),
    position: input.position,
    resourceType: input.resourceType,
    status: input.status,
    storagePath: normalizeText(input.storagePath),
    title: normalizeText(input.title),
    url: normalizeText(input.url),
  };

  if (!normalized.title) {
    errors.push({
      field: "title",
      message: "El titulo es obligatorio.",
    });
  } else if (normalized.title.length > resourceTitleMaxLength) {
    errors.push({
      field: "title",
      message: `El titulo no puede superar ${resourceTitleMaxLength} caracteres.`,
    });
  } else if (hasUnsafeMarkupCharacters(normalized.title)) {
    errors.push({
      field: "title",
      message: "El titulo contiene caracteres no permitidos.",
    });
  }

  if (normalized.description.length > resourceDescriptionMaxLength) {
    errors.push({
      field: "description",
      message: `La descripcion no puede superar ${resourceDescriptionMaxLength} caracteres.`,
    });
  } else if (hasUnsafeMarkupCharacters(normalized.description)) {
    errors.push({
      field: "description",
      message: "La descripcion contiene caracteres no permitidos.",
    });
  }

  if (!isValidResourceType(normalized.resourceType)) {
    errors.push({
      field: "resourceType",
      message: "El tipo de recurso seleccionado no es valido.",
    });
  }

  if (options.requirePosition && normalized.position === null) {
    errors.push({
      field: "position",
      message: "La posicion es obligatoria.",
    });
  }

  if (
    normalized.position !== null &&
    (!Number.isInteger(normalized.position) || normalized.position <= 0)
  ) {
    errors.push({
      field: "position",
      message: "La posicion debe ser un entero mayor que cero.",
    });
  }

  if (!isValidStatus(normalized.status)) {
    errors.push({
      field: "status",
      message: "El estado seleccionado no es valido.",
    });
  }

  if (normalized.url.length > resourceUrlMaxLength) {
    errors.push({
      field: "url",
      message: `La URL no puede superar ${resourceUrlMaxLength} caracteres.`,
    });
  } else if (normalized.url.length > 0 && !isValidUrl(normalized.url)) {
    errors.push({
      field: "url",
      message: "La URL debe ser http o https valida.",
    });
  } else if (hasUnsafeMarkupCharacters(normalized.url)) {
    errors.push({
      field: "url",
      message: "La URL contiene caracteres no permitidos.",
    });
  }

  if (normalized.storagePath.length > resourceStoragePathMaxLength) {
    errors.push({
      field: "storagePath",
      message: `La ruta de archivo no puede superar ${resourceStoragePathMaxLength} caracteres.`,
    });
  } else if (hasUnsafeMarkupCharacters(normalized.storagePath)) {
    errors.push({
      field: "storagePath",
      message: "La ruta de archivo contiene caracteres no permitidos.",
    });
  } else if (
    normalized.storagePath &&
    !StorageService.validatePathForAssetKinds(
      normalized.storagePath,
      [...getAllowedResourceStorageKinds(normalized.resourceType)],
    )
  ) {
    errors.push({
      field: "storagePath",
      message: "La ruta de archivo no corresponde a un recurso permitido.",
    });
  }

  if (!normalized.url && !normalized.storagePath) {
    errors.push({
      field: "general",
      message: "Registra una URL o una ruta de archivo para el recurso.",
    });
  }

  return {
    errors,
    normalized,
  };
}

function createVideoKeyBase(title: string) {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return normalized || "video";
}

function createUniqueVideoKey(title: string, existingKeys: string[]) {
  const baseKey = createVideoKeyBase(title);
  const existing = new Set(existingKeys);

  if (!existing.has(baseKey)) {
    return baseKey;
  }

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${baseKey}-${index}`;

    if (!existing.has(candidate)) {
      return candidate;
    }
  }

  return `${baseKey}-${Date.now()}`;
}

function createResourceKeyBase(title: string) {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return normalized || "resource";
}

function createUniqueResourceKey(title: string, existingKeys: string[]) {
  const baseKey = createResourceKeyBase(title);
  const existing = new Set(existingKeys);

  if (!existing.has(baseKey)) {
    return baseKey;
  }

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${baseKey}-${index}`;

    if (!existing.has(candidate)) {
      return candidate;
    }
  }

  return `${baseKey}-${Date.now()}`;
}

function getNextPosition(currentPositions: number[]) {
  if (currentPositions.length === 0) {
    return 1;
  }

  return Math.max(...currentPositions) + 1;
}

function clampPosition(position: number, maxPosition: number) {
  return Math.max(1, Math.min(position, maxPosition));
}

function reorderVideoRows<T extends { id: string; video_order: number }>({
  rows,
  targetId,
  targetPosition,
}: {
  rows: T[];
  targetId: string;
  targetPosition: number;
}) {
  const sortedRows = [...rows].sort((first, second) =>
    first.video_order - second.video_order
  );
  const targetIndex = sortedRows.findIndex((row) => row.id === targetId);

  if (targetIndex < 0) {
    return sortedRows;
  }

  const [targetRow] = sortedRows.splice(targetIndex, 1);
  const nextIndex = clampPosition(targetPosition, sortedRows.length + 1) - 1;
  sortedRows.splice(nextIndex, 0, targetRow);

  return sortedRows;
}

function reorderResourceRows<T extends { id: string; resource_order: number }>({
  rows,
  targetId,
  targetPosition,
}: {
  rows: T[];
  targetId: string;
  targetPosition: number;
}) {
  const sortedRows = [...rows].sort((first, second) =>
    first.resource_order - second.resource_order
  );
  const targetIndex = sortedRows.findIndex((row) => row.id === targetId);

  if (targetIndex < 0) {
    return sortedRows;
  }

  const [targetRow] = sortedRows.splice(targetIndex, 1);
  const nextIndex = clampPosition(targetPosition, sortedRows.length + 1) - 1;
  sortedRows.splice(nextIndex, 0, targetRow);

  return sortedRows;
}

function toPositionUpdates(rows: Array<{ id: string }>) {
  return rows.map((row, index) => ({
    id: row.id,
    videoOrder: index + 1,
  }));
}

function toResourcePositionUpdates(rows: Array<{ id: string }>) {
  return rows.map((row, index) => ({
    id: row.id,
    resourceOrder: index + 1,
  }));
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
          thumbnail_url: validation.normalized.thumbnailUrl || null,
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

  async createVideo(
    moduleId: string,
    input: AdminContentEditableVideoData,
  ): Promise<AdminContentVideoMutationResult> {
    const validation = validateAdminContentVideoInput(input, {
      requirePosition: false,
    });

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

      const currentVideos = currentModule.videos;
      const nextPosition =
        validation.normalized.position ??
        getNextPosition(currentVideos.map((video) => video.video_order));
      const temporaryPosition = getNextPosition(
        currentVideos.map((video) => video.video_order),
      ) + 1000;
      const createdVideo = await AdminContentRepository.createVideo({
        duration_seconds: validation.normalized.durationSeconds,
        module_id: moduleId,
        provider: validation.normalized.provider,
        provider_video_id: validation.normalized.providerVideoId,
        published_at: getNextVideoPublishedAt({
          currentPublishedAt: null,
          currentStatus: "draft",
          nextStatus: validation.normalized.status,
        }),
        status: validation.normalized.status,
        thumbnail_url: validation.normalized.thumbnailUrl || null,
        title: validation.normalized.title,
        video_key: createUniqueVideoKey(
          validation.normalized.title,
          currentVideos.map((video) => video.video_key),
        ),
        video_order: temporaryPosition,
      });
      const reorderedVideos = reorderVideoRows({
        rows: [...currentVideos, createdVideo],
        targetId: createdVideo.id,
        targetPosition: nextPosition,
      });

      await AdminContentRepository.updateVideoPositions(
        toPositionUpdates(reorderedVideos),
      );

      const refreshedModule =
        await AdminContentRepository.getModuleContent(moduleId);

      return {
        module: mapProgram(refreshedModule).modules[0],
        ok: true,
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible guardar el video.",
          },
        ],
        ok: false,
      };
    }
  },

  async updateVideo(
    moduleId: string,
    videoId: string,
    input: AdminContentEditableVideoData,
  ): Promise<AdminContentVideoMutationResult> {
    const validation = validateAdminContentVideoInput(input, {
      requirePosition: true,
    });

    if (validation.errors.length > 0) {
      return {
        errors: validation.errors,
        ok: false,
      };
    }

    try {
      const currentModule = await AdminContentRepository.getModuleContent(moduleId);
      const currentVideo = currentModule.videos.find(
        (video) => video.id === videoId,
      );

      if (!currentModule.modules[0] || !currentVideo) {
        return {
          errors: [
            {
              field: "general",
              message: "No fue posible encontrar el video solicitado.",
            },
          ],
          ok: false,
        };
      }

      const updatedVideo = await AdminContentRepository.updateVideo(videoId, {
        duration_seconds: validation.normalized.durationSeconds,
        provider: validation.normalized.provider,
        provider_video_id: validation.normalized.providerVideoId,
        published_at: getNextVideoPublishedAt({
          currentPublishedAt: currentVideo.published_at,
          currentStatus: currentVideo.status,
          nextStatus: validation.normalized.status,
        }),
        status: validation.normalized.status,
        thumbnail_url: validation.normalized.thumbnailUrl || null,
        title: validation.normalized.title,
      });
      const videosWithUpdate = currentModule.videos.map((video) =>
        video.id === videoId ? updatedVideo : video,
      );
      const reorderedVideos = reorderVideoRows({
        rows: videosWithUpdate,
        targetId: videoId,
        targetPosition: validation.normalized.position ?? currentVideo.video_order,
      });

      await AdminContentRepository.updateVideoPositions(
        toPositionUpdates(reorderedVideos),
      );

      const refreshedModule =
        await AdminContentRepository.getModuleContent(moduleId);

      return {
        module: mapProgram(refreshedModule).modules[0],
        ok: true,
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible guardar el video.",
          },
        ],
        ok: false,
      };
    }
  },

  async moveVideo(
    moduleId: string,
    videoId: string,
    direction: -1 | 1,
  ): Promise<AdminContentVideoMutationResult> {
    try {
      const currentModule = await AdminContentRepository.getModuleContent(moduleId);
      const sortedVideos = [...currentModule.videos].sort((first, second) =>
        first.video_order - second.video_order
      );
      const currentIndex = sortedVideos.findIndex(
        (video) => video.id === videoId,
      );
      const nextIndex = currentIndex + direction;

      if (
        !currentModule.modules[0] ||
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= sortedVideos.length
      ) {
        return {
          errors: [
            {
              field: "general",
              message: "No fue posible cambiar la posicion del video.",
            },
          ],
          ok: false,
        };
      }

      const nextVideos = [...sortedVideos];
      const currentVideo = nextVideos[currentIndex];
      nextVideos[currentIndex] = nextVideos[nextIndex];
      nextVideos[nextIndex] = currentVideo;

      await AdminContentRepository.updateVideoPositions(
        toPositionUpdates(nextVideos),
      );

      const refreshedModule =
        await AdminContentRepository.getModuleContent(moduleId);

      return {
        module: mapProgram(refreshedModule).modules[0],
        ok: true,
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible cambiar la posicion del video.",
          },
        ],
        ok: false,
      };
    }
  },

  async deleteVideo(
    moduleId: string,
    videoId: string,
  ): Promise<AdminContentVideoMutationResult> {
    try {
      const currentModule = await AdminContentRepository.getModuleContent(moduleId);
      const currentModuleRow = currentModule.modules[0];
      const currentVideo = currentModule.videos.find(
        (video) => video.id === videoId,
      );

      if (!currentModuleRow || !currentVideo) {
        return {
          errors: [
            {
              field: "general",
              message: "No fue posible encontrar el video solicitado.",
            },
          ],
          ok: false,
        };
      }

      if (currentModuleRow.status === "published" && currentModule.videos.length <= 1) {
        return {
          errors: [
            {
              field: "general",
              message:
                "No se puede eliminar el unico video de un modulo publicado.",
            },
          ],
          ok: false,
        };
      }

      await AdminContentRepository.deleteVideo(videoId);
      const remainingVideos = currentModule.videos.filter(
        (video) => video.id !== videoId,
      );

      await AdminContentRepository.updateVideoPositions(
        toPositionUpdates(
          remainingVideos.sort((first, second) =>
            first.video_order - second.video_order
          ),
        ),
      );

      const refreshedModule =
        await AdminContentRepository.getModuleContent(moduleId);

      return {
        module: mapProgram(refreshedModule).modules[0],
        ok: true,
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible eliminar el video.",
          },
        ],
        ok: false,
      };
    }
  },

  async createResource(
    moduleId: string,
    input: AdminContentEditableResourceData,
  ): Promise<AdminContentResourceMutationResult> {
    const validation = validateAdminContentResourceInput(input, {
      requirePosition: false,
    });

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

      const currentResources = currentModule.resources;
      const nextPosition =
        validation.normalized.position ??
        getNextPosition(
          currentResources.map((resource) => resource.resource_order),
        );
      const temporaryPosition = getNextPosition(
        currentResources.map((resource) => resource.resource_order),
      ) + 1000;
      const createdResource = await AdminContentRepository.createResource({
        description: validation.normalized.description,
        metadata: {},
        module_id: moduleId,
        published_at: getNextResourcePublishedAt({
          currentPublishedAt: null,
          currentStatus: "draft",
          nextStatus: validation.normalized.status,
        }),
        resource_key: createUniqueResourceKey(
          validation.normalized.title,
          currentResources.map((resource) => resource.resource_key),
        ),
        resource_order: temporaryPosition,
        resource_type: validation.normalized.resourceType,
        status: validation.normalized.status,
        storage_path: validation.normalized.storagePath || null,
        title: validation.normalized.title,
        url: validation.normalized.url || null,
      });
      const reorderedResources = reorderResourceRows({
        rows: [...currentResources, createdResource],
        targetId: createdResource.id,
        targetPosition: nextPosition,
      });

      await AdminContentRepository.reorderResources(
        toResourcePositionUpdates(reorderedResources),
      );

      const refreshedModule =
        await AdminContentRepository.getModuleContent(moduleId);

      return {
        module: mapProgram(refreshedModule).modules[0],
        ok: true,
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible guardar el recurso.",
          },
        ],
        ok: false,
      };
    }
  },

  async updateResource(
    moduleId: string,
    resourceId: string,
    input: AdminContentEditableResourceData,
  ): Promise<AdminContentResourceMutationResult> {
    const validation = validateAdminContentResourceInput(input, {
      requirePosition: true,
    });

    if (validation.errors.length > 0) {
      return {
        errors: validation.errors,
        ok: false,
      };
    }

    try {
      const currentModule = await AdminContentRepository.getModuleContent(moduleId);
      const currentResource = currentModule.resources.find(
        (resource) => resource.id === resourceId,
      );

      if (!currentModule.modules[0] || !currentResource) {
        return {
          errors: [
            {
              field: "general",
              message: "No fue posible encontrar el recurso solicitado.",
            },
          ],
          ok: false,
        };
      }

      const updatedResource = await AdminContentRepository.updateResource(
        resourceId,
        {
          description: validation.normalized.description,
          metadata: {},
          published_at: getNextResourcePublishedAt({
            currentPublishedAt: currentResource.published_at,
            currentStatus: currentResource.status,
            nextStatus: validation.normalized.status,
          }),
          resource_type: validation.normalized.resourceType,
          status: validation.normalized.status,
          storage_path: validation.normalized.storagePath || null,
          title: validation.normalized.title,
          url: validation.normalized.url || null,
        },
      );
      const resourcesWithUpdate = currentModule.resources.map((resource) =>
        resource.id === resourceId ? updatedResource : resource
      );
      const reorderedResources = reorderResourceRows({
        rows: resourcesWithUpdate,
        targetId: resourceId,
        targetPosition:
          validation.normalized.position ?? currentResource.resource_order,
      });

      await AdminContentRepository.reorderResources(
        toResourcePositionUpdates(reorderedResources),
      );

      const refreshedModule =
        await AdminContentRepository.getModuleContent(moduleId);

      return {
        module: mapProgram(refreshedModule).modules[0],
        ok: true,
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible guardar el recurso.",
          },
        ],
        ok: false,
      };
    }
  },

  async moveResource(
    moduleId: string,
    resourceId: string,
    direction: -1 | 1,
  ): Promise<AdminContentResourceMutationResult> {
    try {
      const currentModule = await AdminContentRepository.getModuleContent(moduleId);
      const sortedResources = [...currentModule.resources].sort(
        (first, second) => first.resource_order - second.resource_order,
      );
      const currentIndex = sortedResources.findIndex(
        (resource) => resource.id === resourceId,
      );
      const nextIndex = currentIndex + direction;

      if (
        !currentModule.modules[0] ||
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= sortedResources.length
      ) {
        return {
          errors: [
            {
              field: "general",
              message: "No fue posible cambiar la posicion del recurso.",
            },
          ],
          ok: false,
        };
      }

      const nextResources = [...sortedResources];
      const currentResource = nextResources[currentIndex];
      nextResources[currentIndex] = nextResources[nextIndex];
      nextResources[nextIndex] = currentResource;

      await AdminContentRepository.reorderResources(
        toResourcePositionUpdates(nextResources),
      );

      const refreshedModule =
        await AdminContentRepository.getModuleContent(moduleId);

      return {
        module: mapProgram(refreshedModule).modules[0],
        ok: true,
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible cambiar la posicion del recurso.",
          },
        ],
        ok: false,
      };
    }
  },

  async deleteResource(
    moduleId: string,
    resourceId: string,
  ): Promise<AdminContentResourceMutationResult> {
    try {
      const currentModule = await AdminContentRepository.getModuleContent(moduleId);
      const currentResource = currentModule.resources.find(
        (resource) => resource.id === resourceId,
      );

      if (!currentModule.modules[0] || !currentResource) {
        return {
          errors: [
            {
              field: "general",
              message: "No fue posible encontrar el recurso solicitado.",
            },
          ],
          ok: false,
        };
      }

      await AdminContentRepository.deleteResource(resourceId);
      const remainingResources = currentModule.resources.filter(
        (resource) => resource.id !== resourceId,
      );

      await AdminContentRepository.reorderResources(
        toResourcePositionUpdates(
          remainingResources.sort(
            (first, second) => first.resource_order - second.resource_order,
          ),
        ),
      );

      const refreshedModule =
        await AdminContentRepository.getModuleContent(moduleId);

      return {
        module: mapProgram(refreshedModule).modules[0],
        ok: true,
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible eliminar el recurso.",
          },
        ],
        ok: false,
      };
    }
  },
};
