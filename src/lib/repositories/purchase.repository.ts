import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  CreatePurchaseInput,
  AttachProviderCheckoutSessionInput,
  AttachProviderPaymentIntentInput,
  PaymentProvider,
  Purchase,
  PurchaseStatus,
  UpdatePurchaseRefundInput,
  UpdatePurchaseStatusInput,
} from "@/lib/types/commercial.types";

type PurchaseRow = Database["public"]["Tables"]["purchases"]["Row"];
type PurchaseInsert = Database["public"]["Tables"]["purchases"]["Insert"];
type PurchaseUpdate = Database["public"]["Tables"]["purchases"]["Update"];

const purchaseSelect = `
  id,
  purchase_number,
  profile_id,
  product_id,
  enrollment_id,
  status,
  payment_provider,
  provider_checkout_session_id,
  provider_payment_intent_id,
  amount_total_minor,
  amount_refunded_minor,
  currency,
  created_at,
  updated_at
`;

function mapSafeInteger(
  value: number | string | null,
  fieldName: string,
): number | null {
  if (value === null) {
    return null;
  }

  const numericValue =
    typeof value === "number" ? value : Number(value);

  if (!Number.isSafeInteger(numericValue)) {
    throw new Error(`${fieldName} must be a safe integer.`);
  }

  return numericValue;
}

function mapPurchase(row: PurchaseRow): Purchase {
  return {
    id: row.id,
    purchaseNumber: row.purchase_number,
    profileId: row.profile_id,
    productId: row.product_id,
    enrollmentId: row.enrollment_id,
    status: mapPurchaseStatus(row.status),
    paymentProvider: mapPaymentProvider(row.payment_provider),
    providerCheckoutSessionId: row.provider_checkout_session_id,
    providerPaymentIntentId: row.provider_payment_intent_id,
    amountTotalMinor: mapSafeInteger(
      row.amount_total_minor,
      "amount_total_minor",
    ),
    amountRefundedMinor:
      mapSafeInteger(row.amount_refunded_minor, "amount_refunded_minor") ?? 0,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPurchaseStatus(status: string): PurchaseStatus {
  if (
    status === "pending" ||
    status === "paid" ||
    status === "failed" ||
    status === "canceled" ||
    status === "refunded" ||
    status === "partially_refunded" ||
    status === "disputed"
  ) {
    return status;
  }

  throw new Error(`Unexpected purchase status: ${status}.`);
}

function mapPaymentProvider(provider: string): PaymentProvider {
  if (provider === "stripe") {
    return provider;
  }

  throw new Error(`Unexpected payment provider: ${provider}.`);
}

export const PurchaseRepository = {
  async getById(
    purchaseId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase | null> {
    const { data, error } = await supabase
      .from("purchases")
      .select(purchaseSelect)
      .eq("id", purchaseId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapPurchase(data) : null;
  },

  async getByPurchaseNumber(
    purchaseNumber: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase | null> {
    const { data, error } = await supabase
      .from("purchases")
      .select(purchaseSelect)
      .eq("purchase_number", purchaseNumber)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapPurchase(data) : null;
  },

  async getByProviderCheckoutSessionId(
    paymentProvider: PaymentProvider,
    checkoutSessionId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase | null> {
    const { data, error } = await supabase
      .from("purchases")
      .select(purchaseSelect)
      .eq("payment_provider", paymentProvider)
      .eq("provider_checkout_session_id", checkoutSessionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapPurchase(data) : null;
  },

  async getByProviderPaymentIntentId(
    paymentProvider: PaymentProvider,
    paymentIntentId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase | null> {
    const { data, error } = await supabase
      .from("purchases")
      .select(purchaseSelect)
      .eq("payment_provider", paymentProvider)
      .eq("provider_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapPurchase(data) : null;
  },

  async listByProfile(
    profileId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase[]> {
    const { data, error } = await supabase
      .from("purchases")
      .select(purchaseSelect)
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data?.map(mapPurchase) ?? [];
  },

  async getRecentPendingByProfileAndProduct(
    input: {
      profileId: string;
      productId: string;
      createdAfter?: string;
    },
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase | null> {
    let query = supabase
      .from("purchases")
      .select(purchaseSelect)
      .eq("profile_id", input.profileId)
      .eq("product_id", input.productId)
      .eq("payment_provider", "stripe")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (input.createdAfter) {
      query = query.gte("created_at", input.createdAfter);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapPurchase(data) : null;
  },

  async create(
    input: CreatePurchaseInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase> {
    const purchaseInsert = {
      profile_id: input.profileId,
      product_id: input.productId,
      enrollment_id: input.enrollmentId ?? null,
      status: input.status ?? "pending",
      payment_provider: input.paymentProvider ?? "stripe",
      provider_checkout_session_id: input.providerCheckoutSessionId ?? null,
      provider_payment_intent_id: input.providerPaymentIntentId ?? null,
      amount_total_minor: input.amountTotalMinor ?? null,
      amount_refunded_minor: input.amountRefundedMinor ?? 0,
      currency: input.currency ?? "USD",
    } satisfies PurchaseInsert;

    const { data, error } = await supabase
      .from("purchases")
      .insert(purchaseInsert)
      .select(purchaseSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapPurchase(data);
  },

  async updateRefund(
    input: UpdatePurchaseRefundInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase> {
    const purchaseUpdate = {
      status: input.status,
      amount_refunded_minor: input.amountRefundedMinor,
    } satisfies PurchaseUpdate;

    const { data, error } = await supabase
      .from("purchases")
      .update(purchaseUpdate)
      .eq("id", input.purchaseId)
      .select(purchaseSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapPurchase(data);
  },

  async updateStatus(
    input: UpdatePurchaseStatusInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase> {
    const purchaseUpdate = {
      status: input.status,
    } satisfies PurchaseUpdate;

    const { data, error } = await supabase
      .from("purchases")
      .update(purchaseUpdate)
      .eq("id", input.purchaseId)
      .select(purchaseSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapPurchase(data);
  },

  async attachProviderCheckoutSession(
    input: AttachProviderCheckoutSessionInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase> {
    const existing = await PurchaseRepository.getById(input.purchaseId, supabase);

    if (!existing) {
      throw new Error("Purchase not found.");
    }

    if (existing.paymentProvider !== "stripe") {
      throw new Error("Purchase payment provider mismatch.");
    }

    if (existing.status !== "pending") {
      throw new Error("Purchase is not pending.");
    }

    if (
      existing.providerCheckoutSessionId &&
      existing.providerCheckoutSessionId !== input.providerCheckoutSessionId
    ) {
      throw new Error("Purchase already has a different checkout session.");
    }

    const purchaseUpdate = {
      provider_checkout_session_id: input.providerCheckoutSessionId,
      provider_payment_intent_id:
        input.providerPaymentIntentId ?? existing.providerPaymentIntentId,
    } satisfies PurchaseUpdate;

    const { data, error } = await supabase
      .from("purchases")
      .update(purchaseUpdate)
      .eq("id", input.purchaseId)
      .eq("status", "pending")
      .select(purchaseSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapPurchase(data);
  },

  async attachProviderPaymentIntent(
    input: AttachProviderPaymentIntentInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Purchase> {
    const existing = await PurchaseRepository.getById(input.purchaseId, supabase);

    if (!existing) {
      throw new Error("Purchase not found.");
    }

    if (
      existing.providerPaymentIntentId &&
      existing.providerPaymentIntentId !== input.providerPaymentIntentId
    ) {
      throw new Error("Purchase already has a different payment intent.");
    }

    const purchaseUpdate = {
      provider_payment_intent_id: input.providerPaymentIntentId,
    } satisfies PurchaseUpdate;

    const { data, error } = await supabase
      .from("purchases")
      .update(purchaseUpdate)
      .eq("id", input.purchaseId)
      .select(purchaseSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapPurchase(data);
  },
};
