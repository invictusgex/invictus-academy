import { ScenarioLibraryRepository } from "@/lib/repositories/scenario-library.repository";
import type {
  AdminScenario,
  AdminScenarioDeleteResult,
  AdminScenarioDetailResult,
  AdminScenarioEditableData,
  AdminScenarioListResult,
  AdminScenarioMutationResult,
  AdminScenarioStatusAction,
  AdminScenarioValidationError,
  NormalizedScenarioLibraryFilters,
  PublishedScenario,
  PublishedScenarioDetailResult,
  PublishedScenarioListResult,
  ScenarioLabelSet,
  ScenarioLibraryFilters,
  ScenarioLibraryRow,
  ScenarioMarket,
  ScenarioStatus,
  ScenarioType,
  ScenarioVideoProvider,
} from "@/lib/types/scenario-library.types";
import {
  scenarioMarketValues,
  scenarioStatusValues,
  scenarioTypeValues,
  scenarioVideoProviderValues,
} from "@/lib/types/scenario-library.types";

const emptyAdminSummary = {
  archived: 0,
  drafts: 0,
  published: 0,
  total: 0,
};

const titleMaxLength = 160;
const summaryMaxLength = 300;
const descriptionMaxLength = 5000;
const instrumentMaxLength = 32;
const urlMaxLength = 500;
const videoIdMaxLength = 300;

const scenarioTypeLabels: Record<ScenarioType, string> = {
  execution_example: "Ejemplo de ejecucion",
  gamma_structure: "Estructura de gamma",
  heatmap: "Heatmap",
  macro_event: "Evento macro",
  market_analysis: "Analisis de mercado",
  order_flow: "Order flow",
  other: "Otro",
  trade_review: "Revision de trade",
  volume_profile: "Perfil de volumen",
};

const scenarioMarketLabels: Record<ScenarioMarket, string> = {
  equities: "Acciones",
  futures: "Futuros",
  macro: "Macro",
  options: "Opciones",
  other: "Otro",
};

const scenarioStatusLabels: Record<ScenarioStatus, string> = {
  archived: "Archivado",
  draft: "Borrador",
  published: "Publicado",
};

const scenarioVideoProviderLabels: Record<ScenarioVideoProvider, string> = {
  bunny: "Bunny",
  external: "Externo",
  vimeo: "Vimeo",
  youtube: "YouTube",
};

function firstString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeText(value: string | undefined) {
  const normalized = value?.trim().replace(/\s+/g, " ") ?? "";

  return normalized.length > 0 ? normalized : null;
}

function normalizeLongText(value: string | undefined) {
  const normalized = value?.trim().replace(/[ \t]+/g, " ") ?? "";

  return normalized.length > 0 ? normalized : null;
}

function normalizeDate(value: string | undefined) {
  const normalized = normalizeText(value);

  if (!normalized || !/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function normalizeYear(value: number | string | undefined) {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(value ?? "", 10);

  if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) {
    return null;
  }

  return parsed;
}

function normalizeScenarioType(
  value: ScenarioType | string | undefined,
): ScenarioType | null {
  if (scenarioTypeValues.includes(value as ScenarioType)) {
    return value as ScenarioType;
  }

  return null;
}

function normalizeMarket(
  value: ScenarioMarket | string | undefined,
): ScenarioMarket | null {
  if (scenarioMarketValues.includes(value as ScenarioMarket)) {
    return value as ScenarioMarket;
  }

  return null;
}

function normalizeVideoProvider(
  value: ScenarioVideoProvider | string | null,
): ScenarioVideoProvider | null {
  if (value && scenarioVideoProviderValues.includes(value as ScenarioVideoProvider)) {
    return value as ScenarioVideoProvider;
  }

  return null;
}

function normalizeStatus(value: ScenarioStatus | string): ScenarioStatus {
  if (scenarioStatusValues.includes(value as ScenarioStatus)) {
    return value as ScenarioStatus;
  }

  return "draft";
}

function isValidStatus(value: ScenarioStatus | string): value is ScenarioStatus {
  return scenarioStatusValues.includes(value as ScenarioStatus);
}

export function normalizeScenarioLibraryFilters(
  filters: ScenarioLibraryFilters = {},
): NormalizedScenarioLibraryFilters {
  return {
    dateFrom: normalizeDate(filters.dateFrom),
    dateTo: normalizeDate(filters.dateTo),
    instrument: normalizeText(filters.instrument)?.toUpperCase() ?? null,
    market: normalizeMarket(filters.market),
    query: normalizeText(filters.query),
    scenarioType: normalizeScenarioType(filters.scenarioType),
    year: normalizeYear(filters.year),
  };
}

export function normalizeScenarioSearchParams(searchParams: {
  dateFrom?: string | string[];
  dateTo?: string | string[];
  instrument?: string | string[];
  market?: string | string[];
  query?: string | string[];
  scenarioType?: string | string[];
  year?: string | string[];
}): NormalizedScenarioLibraryFilters {
  return normalizeScenarioLibraryFilters({
    dateFrom: firstString(searchParams.dateFrom),
    dateTo: firstString(searchParams.dateTo),
    instrument: firstString(searchParams.instrument),
    market: firstString(searchParams.market),
    query: firstString(searchParams.query),
    scenarioType: firstString(searchParams.scenarioType),
    year: firstString(searchParams.year),
  });
}

function isSafeHttpUrl(value: string | null) {
  if (!value) {
    return false;
  }

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

function validateAdminScenarioInput(input: AdminScenarioEditableData) {
  const errors: AdminScenarioValidationError[] = [];
  const normalized: AdminScenarioEditableData = {
    description: normalizeLongText(input.description) ?? "",
    documentUrl: normalizeText(input.documentUrl) ?? "",
    eventDate: normalizeText(input.eventDate) ?? "",
    instrument: (normalizeText(input.instrument) ?? "").toUpperCase(),
    market: input.market,
    scenarioType: input.scenarioType,
    status: input.status,
    summary: normalizeLongText(input.summary) ?? "",
    thumbnailUrl: normalizeText(input.thumbnailUrl) ?? "",
    title: normalizeText(input.title) ?? "",
    videoId: normalizeText(input.videoId) ?? "",
    videoProvider: input.videoProvider,
    videoUrl: normalizeText(input.videoUrl) ?? "",
  };

  if (!normalized.title) {
    errors.push({ field: "title", message: "El titulo es obligatorio." });
  } else if (normalized.title.length > titleMaxLength) {
    errors.push({
      field: "title",
      message: `El titulo no puede superar ${titleMaxLength} caracteres.`,
    });
  } else if (hasUnsafeMarkupCharacters(normalized.title)) {
    errors.push({
      field: "title",
      message: "El titulo contiene caracteres no permitidos.",
    });
  }

  if (!normalized.summary) {
    errors.push({ field: "summary", message: "El resumen es obligatorio." });
  } else if (normalized.summary.length > summaryMaxLength) {
    errors.push({
      field: "summary",
      message: `El resumen no puede superar ${summaryMaxLength} caracteres.`,
    });
  } else if (hasUnsafeMarkupCharacters(normalized.summary)) {
    errors.push({
      field: "summary",
      message: "El resumen contiene caracteres no permitidos.",
    });
  }

  if (normalized.description.length > descriptionMaxLength) {
    errors.push({
      field: "description",
      message: `La descripcion no puede superar ${descriptionMaxLength} caracteres.`,
    });
  } else if (hasUnsafeMarkupCharacters(normalized.description)) {
    errors.push({
      field: "description",
      message: "La descripcion contiene caracteres no permitidos.",
    });
  }

  if (!scenarioTypeValues.includes(normalized.scenarioType)) {
    errors.push({
      field: "scenarioType",
      message: "El tipo de escenario seleccionado no es valido.",
    });
  }

  if (!scenarioMarketValues.includes(normalized.market)) {
    errors.push({
      field: "market",
      message: "El mercado seleccionado no es valido.",
    });
  }

  if (normalized.instrument.length > instrumentMaxLength) {
    errors.push({
      field: "instrument",
      message: `El instrumento no puede superar ${instrumentMaxLength} caracteres.`,
    });
  } else if (hasUnsafeMarkupCharacters(normalized.instrument)) {
    errors.push({
      field: "instrument",
      message: "El instrumento contiene caracteres no permitidos.",
    });
  }

  if (normalized.eventDate && !normalizeDate(normalized.eventDate)) {
    errors.push({
      field: "eventDate",
      message: "La fecha del escenario debe usar formato YYYY-MM-DD.",
    });
  }

  for (const [field, value] of [
    ["thumbnailUrl", normalized.thumbnailUrl],
    ["videoUrl", normalized.videoUrl],
    ["documentUrl", normalized.documentUrl],
  ] as const) {
    if (value.length > urlMaxLength) {
      errors.push({
        field,
        message: `La URL no puede superar ${urlMaxLength} caracteres.`,
      });
    } else if (value && !isSafeHttpUrl(value)) {
      errors.push({
        field,
        message: "La URL debe ser http o https valida.",
      });
    }
  }

  if (normalized.videoId.length > videoIdMaxLength) {
    errors.push({
      field: "videoId",
      message: `El ID de video no puede superar ${videoIdMaxLength} caracteres.`,
    });
  } else if (hasUnsafeMarkupCharacters(normalized.videoId)) {
    errors.push({
      field: "videoId",
      message: "El ID de video contiene caracteres no permitidos.",
    });
  }

  if (
    normalized.videoProvider &&
    !scenarioVideoProviderValues.includes(normalized.videoProvider)
  ) {
    errors.push({
      field: "videoProvider",
      message: "El proveedor de video seleccionado no es valido.",
    });
  }

  if (!normalized.videoProvider && (normalized.videoId || normalized.videoUrl)) {
    errors.push({
      field: "videoProvider",
      message: "Selecciona un proveedor antes de registrar video.",
    });
  }

  if (normalized.videoProvider === "external") {
    if (!normalized.videoUrl) {
      errors.push({
        field: "videoUrl",
        message: "El proveedor externo requiere una URL de video.",
      });
    }

    if (normalized.videoId) {
      errors.push({
        field: "videoId",
        message: "El proveedor externo no utiliza ID de video.",
      });
    }
  }

  if (
    normalized.videoProvider &&
    normalized.videoProvider !== "external" &&
    !normalized.videoId
  ) {
    errors.push({
      field: "videoId",
      message: "El proveedor seleccionado requiere ID de video.",
    });
  }

  if (
    normalized.videoProvider &&
    normalized.videoProvider !== "external" &&
    normalized.videoUrl
  ) {
    errors.push({
      field: "videoUrl",
      message: "Usa ID de video o URL, no ambos.",
    });
  }

  if (!isValidStatus(normalized.status)) {
    errors.push({
      field: "status",
      message: "El estado seleccionado no es valido.",
    });
  }

  return {
    errors,
    normalized,
  };
}

function getNextScenarioPublishedAt({
  currentPublishedAt,
  currentStatus,
  nextStatus,
}: {
  currentPublishedAt: string | null;
  currentStatus: ScenarioStatus;
  nextStatus: ScenarioStatus;
}) {
  if (nextStatus !== "published") {
    return null;
  }

  if (currentStatus === "published" && currentPublishedAt) {
    return currentPublishedAt;
  }

  return currentPublishedAt ?? new Date().toISOString();
}

function createScenarioKeyBase(title: string) {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);

  return normalized || "scenario";
}

async function createUniqueScenarioKey(title: string) {
  const baseKey = createScenarioKeyBase(title);

  if (!(await ScenarioLibraryRepository.scenarioKeyExists(baseKey))) {
    return baseKey;
  }

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${baseKey}-${index}`;

    if (!(await ScenarioLibraryRepository.scenarioKeyExists(candidate))) {
      return candidate;
    }
  }

  return `${baseKey}-${Date.now()}`;
}

function toScenarioRow({
  currentPublishedAt,
  currentStatus,
  input,
}: {
  currentPublishedAt: string | null;
  currentStatus: ScenarioStatus;
  input: AdminScenarioEditableData;
}) {
  return {
    description: input.description,
    document_url: input.documentUrl || null,
    event_date: input.eventDate || null,
    instrument: input.instrument,
    market: input.market,
    metadata: {},
    published_at: getNextScenarioPublishedAt({
      currentPublishedAt,
      currentStatus,
      nextStatus: input.status,
    }),
    scenario_type: input.scenarioType,
    status: input.status,
    summary: input.summary,
    thumbnail_url: input.thumbnailUrl || null,
    title: input.title,
    video_id: input.videoId || null,
    video_provider: input.videoProvider || null,
    video_url: input.videoUrl || null,
  };
}

function buildVideoEmbedUrl(row: ScenarioLibraryRow) {
  const provider = normalizeVideoProvider(row.video_provider);

  if (provider === "youtube" && row.video_id) {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(row.video_id)}`;
  }

  if (provider === "vimeo" && row.video_id) {
    return `https://player.vimeo.com/video/${encodeURIComponent(row.video_id)}`;
  }

  return null;
}

function buildLabels(row: ScenarioLibraryRow): ScenarioLabelSet {
  const videoProvider = normalizeVideoProvider(row.video_provider);

  return {
    market: scenarioMarketLabels[row.market],
    scenarioType: scenarioTypeLabels[row.scenario_type],
    status: scenarioStatusLabels[normalizeStatus(row.status)],
    videoProvider: videoProvider
      ? scenarioVideoProviderLabels[videoProvider]
      : null,
  };
}

function mapPublishedScenario(row: ScenarioLibraryRow): PublishedScenario {
  const videoUrl = isSafeHttpUrl(row.video_url) ? row.video_url : null;

  return {
    description: row.description,
    documentUrl: isSafeHttpUrl(row.document_url) ? row.document_url : null,
    eventDate: row.event_date,
    id: row.id,
    instrument: row.instrument,
    labels: buildLabels(row),
    market: row.market,
    publishedAt: row.published_at,
    scenarioKey: row.scenario_key,
    scenarioType: row.scenario_type,
    summary: row.summary,
    thumbnailUrl: isSafeHttpUrl(row.thumbnail_url) ? row.thumbnail_url : null,
    title: row.title,
    videoEmbedUrl: buildVideoEmbedUrl(row),
    videoProvider: normalizeVideoProvider(row.video_provider),
    videoUrl,
  };
}

function mapAdminScenario(row: ScenarioLibraryRow): AdminScenario {
  return {
    ...mapPublishedScenario(row),
    createdAt: row.created_at,
    metadata: row.metadata,
    status: normalizeStatus(row.status),
    updatedAt: row.updated_at,
    videoId: row.video_id,
  };
}

export const ScenarioLibraryService = {
  async getPublishedScenarios(
    filters: ScenarioLibraryFilters = {},
  ): Promise<PublishedScenarioListResult> {
    try {
      const rows = await ScenarioLibraryRepository.getPublishedScenarios(
        normalizeScenarioLibraryFilters(filters),
      );

      return {
        ok: true,
        scenarios: rows.map(mapPublishedScenario),
      };
    } catch {
      return {
        message: "No fue posible cargar la biblioteca de escenarios.",
        ok: false,
        scenarios: [],
      };
    }
  },

  async getPublishedScenarioByIdOrKey(
    idOrKey: string,
  ): Promise<PublishedScenarioDetailResult> {
    try {
      const row =
        await ScenarioLibraryRepository.getPublishedScenarioByIdOrKey(idOrKey);

      return {
        ok: true,
        scenario: row ? mapPublishedScenario(row) : null,
      };
    } catch {
      return {
        message: "No fue posible cargar el escenario solicitado.",
        ok: false,
        scenario: null,
      };
    }
  },

  async getAdminScenarios(
    filters: ScenarioLibraryFilters = {},
  ): Promise<AdminScenarioListResult> {
    try {
      const normalizedFilters = normalizeScenarioLibraryFilters(filters);
      const [rows, summary] = await Promise.all([
        ScenarioLibraryRepository.getAdminScenarios(normalizedFilters),
        ScenarioLibraryRepository.getAdminScenarioSummary(),
      ]);

      return {
        ok: true,
        scenarios: rows.map(mapAdminScenario),
        summary,
      };
    } catch {
      return {
        message: "No fue posible cargar los escenarios administrativos.",
        ok: false,
        scenarios: [],
        summary: emptyAdminSummary,
      };
    }
  },

  async getAdminScenarioById(
    scenarioId: string,
  ): Promise<AdminScenarioDetailResult> {
    try {
      const row = await ScenarioLibraryRepository.getAdminScenarioById(scenarioId);

      return {
        ok: true,
        scenario: row ? mapAdminScenario(row) : null,
      };
    } catch {
      return {
        message: "No fue posible cargar el escenario administrativo.",
        ok: false,
        scenario: null,
      };
    }
  },

  async createScenario(
    input: AdminScenarioEditableData,
  ): Promise<AdminScenarioMutationResult> {
    const validation = validateAdminScenarioInput(input);

    if (validation.errors.length > 0) {
      return {
        errors: validation.errors,
        ok: false,
      };
    }

    try {
      const scenarioKey = await createUniqueScenarioKey(
        validation.normalized.title,
      );
      const createdRow = await ScenarioLibraryRepository.createScenario({
        ...toScenarioRow({
          currentPublishedAt: null,
          currentStatus: "draft",
          input: validation.normalized,
        }),
        scenario_key: scenarioKey,
      });

      return {
        ok: true,
        scenario: mapAdminScenario(createdRow),
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible crear el escenario.",
          },
        ],
        ok: false,
      };
    }
  },

  async updateScenario(
    scenarioId: string,
    input: AdminScenarioEditableData,
  ): Promise<AdminScenarioMutationResult> {
    const validation = validateAdminScenarioInput(input);

    if (validation.errors.length > 0) {
      return {
        errors: validation.errors,
        ok: false,
      };
    }

    try {
      const currentRow =
        await ScenarioLibraryRepository.getAdminScenarioById(scenarioId);

      if (!currentRow) {
        return {
          errors: [
            {
              field: "general",
              message: "No fue posible encontrar el escenario solicitado.",
            },
          ],
          ok: false,
        };
      }

      const updatedRow = await ScenarioLibraryRepository.updateScenario(
        scenarioId,
        toScenarioRow({
          currentPublishedAt: currentRow.published_at,
          currentStatus: currentRow.status,
          input: validation.normalized,
        }),
      );

      return {
        ok: true,
        scenario: mapAdminScenario(updatedRow),
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible guardar el escenario.",
          },
        ],
        ok: false,
      };
    }
  },

  async updateScenarioStatus(
    scenarioId: string,
    action: AdminScenarioStatusAction,
  ): Promise<AdminScenarioMutationResult> {
    try {
      const currentRow =
        await ScenarioLibraryRepository.getAdminScenarioById(scenarioId);

      if (!currentRow) {
        return {
          errors: [
            {
              field: "general",
              message: "No fue posible encontrar el escenario solicitado.",
            },
          ],
          ok: false,
        };
      }

      const nextStatus =
        action === "publish"
          ? "published"
          : action === "archive"
            ? "archived"
            : "draft";
      const updatedRow = await ScenarioLibraryRepository.updateScenarioStatus(
        scenarioId,
        {
          published_at: getNextScenarioPublishedAt({
            currentPublishedAt: currentRow.published_at,
            currentStatus: currentRow.status,
            nextStatus,
          }),
          status: nextStatus,
        },
      );

      return {
        ok: true,
        scenario: mapAdminScenario(updatedRow),
      };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible actualizar el estado del escenario.",
          },
        ],
        ok: false,
      };
    }
  },

  async deleteScenario(scenarioId: string): Promise<AdminScenarioDeleteResult> {
    try {
      const currentRow =
        await ScenarioLibraryRepository.getAdminScenarioById(scenarioId);

      if (!currentRow) {
        return {
          errors: [
            {
              field: "general",
              message: "No fue posible encontrar el escenario solicitado.",
            },
          ],
          ok: false,
        };
      }

      if (currentRow.status === "published") {
        return {
          errors: [
            {
              field: "general",
              message: "No se puede eliminar un escenario publicado.",
            },
          ],
          ok: false,
        };
      }

      await ScenarioLibraryRepository.deleteScenario(scenarioId);

      return { ok: true };
    } catch {
      return {
        errors: [
          {
            field: "general",
            message: "No fue posible eliminar el escenario.",
          },
        ],
        ok: false,
      };
    }
  },
};
