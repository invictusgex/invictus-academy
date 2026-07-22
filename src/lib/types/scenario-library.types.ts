export const scenarioTypeValues = [
  "market_analysis",
  "trade_review",
  "execution_example",
  "gamma_structure",
  "order_flow",
  "heatmap",
  "volume_profile",
  "macro_event",
  "other",
] as const;

export const scenarioMarketValues = [
  "futures",
  "options",
  "equities",
  "macro",
  "other",
] as const;

export const scenarioStatusValues = [
  "draft",
  "published",
  "archived",
] as const;

export const scenarioVideoProviderValues = [
  "youtube",
  "vimeo",
  "bunny",
  "external",
] as const;

export type ScenarioType = (typeof scenarioTypeValues)[number];
export type ScenarioMarket = (typeof scenarioMarketValues)[number];
export type ScenarioStatus = (typeof scenarioStatusValues)[number];
export type ScenarioVideoProvider =
  (typeof scenarioVideoProviderValues)[number];

export type ScenarioLibraryRow = {
  created_at: string;
  description: string;
  document_url: string | null;
  event_date: string | null;
  id: string;
  instrument: string;
  market: ScenarioMarket;
  metadata: Record<string, unknown>;
  published_at: string | null;
  scenario_key: string;
  scenario_type: ScenarioType;
  status: ScenarioStatus;
  summary: string;
  thumbnail_url: string | null;
  title: string;
  updated_at: string;
  video_id: string | null;
  video_provider: ScenarioVideoProvider | null;
  video_url: string | null;
};

export type ScenarioLibraryFilters = {
  dateFrom?: string;
  dateTo?: string;
  instrument?: string;
  market?: ScenarioMarket | string;
  query?: string;
  scenarioType?: ScenarioType | string;
  year?: number | string;
};

export type NormalizedScenarioLibraryFilters = {
  dateFrom: string | null;
  dateTo: string | null;
  instrument: string | null;
  market: ScenarioMarket | null;
  query: string | null;
  scenarioType: ScenarioType | null;
  year: number | null;
};

export type ScenarioLabelSet = {
  market: string;
  scenarioType: string;
  status: string;
  videoProvider: string | null;
};

export type PublishedScenario = {
  description: string;
  documentUrl: string | null;
  eventDate: string | null;
  id: string;
  instrument: string;
  labels: ScenarioLabelSet;
  market: ScenarioMarket;
  publishedAt: string | null;
  scenarioKey: string;
  scenarioType: ScenarioType;
  summary: string;
  thumbnailUrl: string | null;
  title: string;
  videoEmbedUrl: string | null;
  videoProvider: ScenarioVideoProvider | null;
  videoUrl: string | null;
};

export type AdminScenario = PublishedScenario & {
  createdAt: string;
  metadata: Record<string, unknown>;
  status: ScenarioStatus;
  thumbnailStorageValue: string;
  updatedAt: string;
  videoId: string | null;
};

export type AdminScenarioSummary = {
  archived: number;
  drafts: number;
  published: number;
  total: number;
};

export type AdminScenarioEditableData = {
  description: string;
  documentUrl: string;
  eventDate: string;
  instrument: string;
  market: ScenarioMarket;
  scenarioType: ScenarioType;
  status: ScenarioStatus;
  summary: string;
  thumbnailUrl: string;
  title: string;
  videoId: string;
  videoProvider: ScenarioVideoProvider | "";
  videoUrl: string;
};

export type AdminScenarioValidationField =
  | "description"
  | "documentUrl"
  | "eventDate"
  | "general"
  | "instrument"
  | "market"
  | "scenarioType"
  | "status"
  | "summary"
  | "thumbnailUrl"
  | "title"
  | "videoId"
  | "videoProvider"
  | "videoUrl";

export type AdminScenarioValidationError = {
  field: AdminScenarioValidationField;
  message: string;
};

export type AdminScenarioMutationResult =
  | {
      ok: true;
      scenario: AdminScenario;
    }
  | {
      errors: AdminScenarioValidationError[];
      ok: false;
    };

export type AdminScenarioDeleteResult =
  | {
      ok: true;
    }
  | {
      errors: AdminScenarioValidationError[];
      ok: false;
    };

export type AdminScenarioStatusAction =
  | "archive"
  | "publish"
  | "return_to_draft";

export type PublishedScenarioListResult =
  | {
      ok: true;
      scenarios: PublishedScenario[];
    }
  | {
      message: string;
      ok: false;
      scenarios: [];
    };

export type PublishedScenarioDetailResult =
  | {
      ok: true;
      scenario: PublishedScenario | null;
    }
  | {
      message: string;
      ok: false;
      scenario: null;
    };

export type AdminScenarioListResult =
  | {
      ok: true;
      scenarios: AdminScenario[];
      summary: AdminScenarioSummary;
    }
  | {
      message: string;
      ok: false;
      scenarios: [];
      summary: AdminScenarioSummary;
    };

export type AdminScenarioDetailResult =
  | {
      ok: true;
      scenario: AdminScenario | null;
    }
  | {
      message: string;
      ok: false;
      scenario: null;
    };
