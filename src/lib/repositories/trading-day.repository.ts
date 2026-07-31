import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database } from "@/lib/supabase/database.types";
import type { TradingDay } from "@/lib/types/trading-day.types";

type TradingDayRow =
  Database["public"]["Tables"]["academy_trading_days"]["Row"];

type TradingDayScope = {
  enrollmentId: string;
  productId: string;
  profileId: string;
};

const tradingDaySelect = `
  id,
  profile_id,
  enrollment_id,
  product_id,
  trading_date,
  notes,
  created_at,
  updated_at
`;

function mapTradingDay(row: TradingDayRow): TradingDay {
  return {
    id: row.id,
    profileId: row.profile_id,
    enrollmentId: row.enrollment_id,
    productId: row.product_id,
    tradingDate: row.trading_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const TradingDayRepository = {
  async listByScope(
    scope: Pick<TradingDayScope, "productId" | "profileId">,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<TradingDay[]> {
    const { data, error } = await supabase
      .from("academy_trading_days")
      .select(tradingDaySelect)
      .eq("profile_id", scope.profileId)
      .eq("product_id", scope.productId)
      .order("trading_date", { ascending: false });

    if (error) {
      throw error;
    }

    return ((data as TradingDayRow[] | null) ?? []).map(mapTradingDay);
  },

  async countUniqueTradingDates(
    scope: Pick<TradingDayScope, "enrollmentId" | "productId" | "profileId">,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<number> {
    const { count, error } = await supabase
      .from("academy_trading_days")
      .select("trading_date", {
        count: "exact",
        head: true,
      })
      .eq("profile_id", scope.profileId)
      .eq("product_id", scope.productId)
      .eq("enrollment_id", scope.enrollmentId);

    if (error) {
      throw error;
    }

    return count ?? 0;
  },

  async create(
    input: TradingDayScope & {
      notes: string | null;
      tradingDate: string;
    },
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<TradingDay> {
    const { data, error } = await supabase
      .from("academy_trading_days")
      .insert({
        enrollment_id: input.enrollmentId,
        notes: input.notes,
        product_id: input.productId,
        profile_id: input.profileId,
        trading_date: input.tradingDate,
      })
      .select(tradingDaySelect)
      .single();

    if (error) {
      throw error;
    }

    return mapTradingDay(data);
  },

  async update(
    input: Pick<TradingDayScope, "productId" | "profileId"> & {
      id: string;
      notes: string | null;
      tradingDate: string;
    },
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<TradingDay> {
    const { data, error } = await supabase
      .from("academy_trading_days")
      .update({
        notes: input.notes,
        trading_date: input.tradingDate,
      })
      .eq("id", input.id)
      .eq("profile_id", input.profileId)
      .eq("product_id", input.productId)
      .select(tradingDaySelect)
      .single();

    if (error) {
      throw error;
    }

    return mapTradingDay(data);
  },

  async delete(
    input: Pick<TradingDayScope, "productId" | "profileId"> & {
      id: string;
    },
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<void> {
    const { error } = await supabase
      .from("academy_trading_days")
      .delete()
      .eq("id", input.id)
      .eq("profile_id", input.profileId)
      .eq("product_id", input.productId);

    if (error) {
      throw error;
    }
  },
};
