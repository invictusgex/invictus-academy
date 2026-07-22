import {
  getSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/database/client";
import type {
  NormalizedScenarioLibraryFilters,
  ScenarioLibraryRow,
} from "@/lib/types/scenario-library.types";

const scenarioSelect = `
  id,
  scenario_key,
  title,
  summary,
  description,
  scenario_type,
  market,
  instrument,
  event_date,
  thumbnail_url,
  video_provider,
  video_id,
  video_url,
  document_url,
  metadata,
  status,
  published_at,
  created_at,
  updated_at
`;

const emptySummary = {
  archived: 0,
  drafts: 0,
  published: 0,
  total: 0,
};

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured for scenario library.");
  }
}

function applyFilters<QueryBuilder>(
  query: QueryBuilder,
  filters: NormalizedScenarioLibraryFilters,
) {
  let nextQuery = query as QueryBuilder & {
    eq: (column: string, value: string | number) => typeof nextQuery;
    gte: (column: string, value: string) => typeof nextQuery;
    ilike: (column: string, value: string) => typeof nextQuery;
    lte: (column: string, value: string) => typeof nextQuery;
  };

  if (filters.scenarioType) {
    nextQuery = nextQuery.eq("scenario_type", filters.scenarioType);
  }

  if (filters.market) {
    nextQuery = nextQuery.eq("market", filters.market);
  }

  if (filters.instrument) {
    nextQuery = nextQuery.ilike("instrument", filters.instrument);
  }

  if (filters.query) {
    nextQuery = nextQuery.ilike("title", `%${filters.query}%`);
  }

  if (filters.dateFrom) {
    nextQuery = nextQuery.gte("event_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    nextQuery = nextQuery.lte("event_date", filters.dateTo);
  }

  if (filters.year) {
    nextQuery = nextQuery
      .gte("event_date", `${filters.year}-01-01`)
      .lte("event_date", `${filters.year}-12-31`);
  }

  return nextQuery as QueryBuilder;
}

export const ScenarioLibraryRepository = {
  async getPublishedScenarios(
    filters: NormalizedScenarioLibraryFilters,
  ): Promise<ScenarioLibraryRow[]> {
    ensureSupabaseConfigured();

    const supabase = getSupabaseClient();
    const baseQuery = supabase
      .from("market_scenarios")
      .select(scenarioSelect)
      .eq("status", "published");
    const query = applyFilters(baseQuery, filters)
      .order("event_date", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false, nullsFirst: false });
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as unknown as ScenarioLibraryRow[] | null) ?? [];
  },

  async getPublishedScenarioByIdOrKey(
    idOrKey: string,
  ): Promise<ScenarioLibraryRow | null> {
    ensureSupabaseConfigured();

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("market_scenarios")
      .select(scenarioSelect)
      .eq("status", "published")
      .or(`id.eq.${idOrKey},scenario_key.eq.${idOrKey}`)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as unknown as ScenarioLibraryRow | null) ?? null;
  },

  async getAdminScenarios(
    filters: NormalizedScenarioLibraryFilters,
  ): Promise<ScenarioLibraryRow[]> {
    ensureSupabaseConfigured();

    const supabase = getSupabaseClient();
    const baseQuery = supabase
      .from("market_scenarios")
      .select(scenarioSelect);
    const query = applyFilters(baseQuery, filters)
      .order("updated_at", { ascending: false });
    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data as unknown as ScenarioLibraryRow[] | null) ?? [];
  },

  async getAdminScenarioById(
    scenarioId: string,
  ): Promise<ScenarioLibraryRow | null> {
    ensureSupabaseConfigured();

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("market_scenarios")
      .select(scenarioSelect)
      .eq("id", scenarioId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as unknown as ScenarioLibraryRow | null) ?? null;
  },

  async getAdminScenarioSummary() {
    ensureSupabaseConfigured();

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("market_scenarios")
      .select("status");

    if (error) {
      throw error;
    }

    const rows =
      (data as unknown as Array<{ status: ScenarioLibraryRow["status"] }> | null) ??
      [];

    return rows.reduce((summary, row) => {
      if (row.status === "published") {
        return { ...summary, published: summary.published + 1, total: summary.total + 1 };
      }

      if (row.status === "archived") {
        return { ...summary, archived: summary.archived + 1, total: summary.total + 1 };
      }

      return { ...summary, drafts: summary.drafts + 1, total: summary.total + 1 };
    }, emptySummary);
  },
};
