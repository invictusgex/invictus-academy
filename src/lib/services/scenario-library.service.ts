import { ScenarioLibraryRepository } from "@/lib/repositories/scenario-library.repository";
import type {
  AdminScenario,
  AdminScenarioDetailResult,
  AdminScenarioListResult,
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
};
