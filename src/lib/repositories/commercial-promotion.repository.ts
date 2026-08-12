import { getSupabaseClient } from "@/lib/database/client";
import {
  defaultCommercialPromotion,
  primaryCommercialPromotionId,
} from "@/lib/promotions/default-commercial-promotion";
import type {
  CommercialPromotion,
  CommercialPromotionInput,
} from "@/lib/types/promotion.types";

type PromotionRow = {
  checkout_description: string;
  checkout_instruction: string;
  checkout_title: string;
  code: string;
  discount_label: string;
  ends_at: string | null;
  headline: string;
  id: string;
  is_active: boolean;
  message: string;
  starts_at: string | null;
  updated_at: string;
};

const promotionSelect = `
  id,
  code,
  discount_label,
  headline,
  message,
  checkout_title,
  checkout_description,
  checkout_instruction,
  is_active,
  starts_at,
  ends_at,
  updated_at
`;

function isMissingPromotionTableError(error: { code?: string; message?: string }) {
  return (
    error.code === "42P01" ||
    error.message?.toLowerCase().includes("site_promotions") === true
  );
}

function mapPromotion(row: PromotionRow): CommercialPromotion {
  return {
    checkoutDescription: row.checkout_description,
    checkoutInstruction: row.checkout_instruction,
    checkoutTitle: row.checkout_title,
    code: row.code,
    discountLabel: row.discount_label,
    endsAt: row.ends_at,
    headline: row.headline,
    id: row.id,
    isActive: row.is_active,
    message: row.message,
    startsAt: row.starts_at,
    updatedAt: row.updated_at,
  };
}

function toPromotionRow(input: CommercialPromotionInput) {
  return {
    checkout_description: input.checkoutDescription,
    checkout_instruction: input.checkoutInstruction,
    checkout_title: input.checkoutTitle,
    code: input.code,
    discount_label: input.discountLabel,
    ends_at: input.endsAt,
    headline: input.headline,
    id: primaryCommercialPromotionId,
    is_active: input.isActive,
    message: input.message,
    starts_at: input.startsAt,
  };
}

export const CommercialPromotionRepository = {
  async getActivePromotion(): Promise<CommercialPromotion | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("site_promotions")
      .select(promotionSelect)
      .eq("id", primaryCommercialPromotionId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      if (isMissingPromotionTableError(error)) {
        return defaultCommercialPromotion;
      }

      throw error;
    }

    return data ? mapPromotion(data as PromotionRow) : null;
  },

  async getPrimaryPromotionForAdmin(): Promise<CommercialPromotion> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("site_promotions")
      .select(promotionSelect)
      .eq("id", primaryCommercialPromotionId)
      .maybeSingle();

    if (error) {
      if (isMissingPromotionTableError(error)) {
        return defaultCommercialPromotion;
      }

      throw error;
    }

    return data ? mapPromotion(data as PromotionRow) : defaultCommercialPromotion;
  },

  async upsertPrimaryPromotion(
    input: CommercialPromotionInput,
  ): Promise<CommercialPromotion> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("site_promotions")
      .upsert(toPromotionRow(input), { onConflict: "id" })
      .select(promotionSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapPromotion(data as PromotionRow);
  },
};
