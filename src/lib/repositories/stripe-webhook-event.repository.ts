import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database, Json } from "@/lib/supabase/database.types";
import type {
  CreateStripeWebhookEventInput,
  StripeWebhookEvent,
  WebhookProcessingStatus,
} from "@/lib/types/commercial.types";

type StripeWebhookEventRow =
  Database["public"]["Tables"]["stripe_webhook_events"]["Row"];
type StripeWebhookEventInsert =
  Database["public"]["Tables"]["stripe_webhook_events"]["Insert"];
type StripeWebhookEventUpdate =
  Database["public"]["Tables"]["stripe_webhook_events"]["Update"];

const stripeWebhookEventSelect = `
  id,
  stripe_event_id,
  event_type,
  api_version,
  livemode,
  processing_status,
  attempt_count,
  last_error_code,
  purchase_id,
  received_at,
  processed_at,
  error_message,
  payload_summary,
  created_at,
  updated_at
`;

function mapStripeWebhookEvent(
  row: StripeWebhookEventRow,
): StripeWebhookEvent {
  return {
    id: row.id,
    stripeEventId: row.stripe_event_id,
    eventType: row.event_type,
    apiVersion: row.api_version,
    livemode: row.livemode,
    processingStatus: mapWebhookProcessingStatus(row.processing_status),
    attemptCount: mapSafeAttemptCount(row.attempt_count),
    lastErrorCode: row.last_error_code,
    purchaseId: row.purchase_id,
    receivedAt: row.received_at,
    processedAt: row.processed_at,
    errorMessage: row.error_message,
    payloadSummary: mapJsonObject(row.payload_summary),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSafeAttemptCount(value: number | string): number {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isSafeInteger(numericValue)) {
    throw new Error("attempt_count must be a safe integer.");
  }

  return numericValue;
}

function isJsonValue(value: unknown): value is Json {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (typeof value === "object") {
    return Object.values(value).every((entry) => entry === undefined || isJsonValue(entry));
  }

  return false;
}

function toJsonObject(value: Record<string, unknown> | null | undefined) {
  if (!value) {
    return null;
  }

  const jsonObject: Record<string, Json | undefined> = {};

  Object.entries(value).forEach(([key, entry]) => {
    if (!isJsonValue(entry)) {
      throw new Error(`payload_summary.${key} must be JSON serializable.`);
    }

    jsonObject[key] = entry;
  });

  return jsonObject;
}

function mapJsonObject(value: Json | null): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return Object.fromEntries(Object.entries(value));
}

function mapWebhookProcessingStatus(status: string): WebhookProcessingStatus {
  if (
    status === "received" ||
    status === "processing" ||
    status === "processed" ||
    status === "failed" ||
    status === "ignored"
  ) {
    return status;
  }

  throw new Error(`Unexpected webhook processing status: ${status}.`);
}

async function updateProcessingStatus(
  stripeEventId: string,
  values: {
    processing_status: WebhookProcessingStatus;
    processed_at?: string | null;
    last_error_code?: string | null;
    error_message?: string | null;
    purchase_id?: string | null;
    attempt_count?: number;
  },
  supabase: SupabaseClient<Database>,
): Promise<StripeWebhookEvent> {
  const { data, error } = await supabase
    .from("stripe_webhook_events")
    .update(values satisfies StripeWebhookEventUpdate)
    .eq("stripe_event_id", stripeEventId)
    .select(stripeWebhookEventSelect)
    .single();

  if (error) {
    throw error;
  }

  return mapStripeWebhookEvent(data);
}

export const StripeWebhookEventRepository = {
  async getByStripeEventId(
    stripeEventId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<StripeWebhookEvent | null> {
    const { data, error } = await supabase
      .from("stripe_webhook_events")
      .select(stripeWebhookEventSelect)
      .eq("stripe_event_id", stripeEventId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapStripeWebhookEvent(data) : null;
  },

  async createReceived(
    input: CreateStripeWebhookEventInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<StripeWebhookEvent> {
    const stripeWebhookEventInsert = {
      stripe_event_id: input.stripeEventId,
      event_type: input.eventType,
      api_version: input.apiVersion ?? null,
      livemode: input.livemode,
      processing_status: input.processingStatus ?? "received",
      purchase_id: input.purchaseId ?? null,
      received_at: input.receivedAt ?? new Date().toISOString(),
      processed_at: input.processedAt ?? null,
      attempt_count: input.attemptCount ?? 0,
      last_error_code: input.lastErrorCode ?? null,
      error_message: input.errorMessage ?? null,
      payload_summary: toJsonObject(input.payloadSummary),
    } satisfies StripeWebhookEventInsert;

    const { data, error } = await supabase
      .from("stripe_webhook_events")
      .insert(stripeWebhookEventInsert)
      .select(stripeWebhookEventSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapStripeWebhookEvent(data);
  },

  async createReceivedIfAbsent(
    input: CreateStripeWebhookEventInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<{
    event: StripeWebhookEvent;
    created: boolean;
  }> {
    const stripeWebhookEventInsert = {
      stripe_event_id: input.stripeEventId,
      event_type: input.eventType,
      api_version: input.apiVersion ?? null,
      livemode: input.livemode,
      processing_status: input.processingStatus ?? "received",
      purchase_id: input.purchaseId ?? null,
      received_at: input.receivedAt ?? new Date().toISOString(),
      processed_at: input.processedAt ?? null,
      attempt_count: input.attemptCount ?? 0,
      last_error_code: input.lastErrorCode ?? null,
      error_message: input.errorMessage ?? null,
      payload_summary: toJsonObject(input.payloadSummary),
    } satisfies StripeWebhookEventInsert;

    const { data, error } = await supabase
      .from("stripe_webhook_events")
      .insert(stripeWebhookEventInsert)
      .select(stripeWebhookEventSelect)
      .single();

    if (!error) {
      return {
        event: mapStripeWebhookEvent(data),
        created: true,
      };
    }

    if ("code" in error && error.code === "23505") {
      const existing = await StripeWebhookEventRepository.getByStripeEventId(
        input.stripeEventId,
        supabase,
      );

      if (existing) {
        return {
          event: existing,
          created: false,
        };
      }
    }

    throw error;
  },

  async markProcessing(
    stripeEventId: string,
    input: {
      attemptCount: number;
    },
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<StripeWebhookEvent> {
    return updateProcessingStatus(
      stripeEventId,
      {
        processing_status: "processing",
        attempt_count: input.attemptCount,
      },
      supabase,
    );
  },

  async markProcessed(
    stripeEventId: string,
    input: {
      purchaseId?: string | null;
      processedAt?: string;
    } = {},
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<StripeWebhookEvent> {
    return updateProcessingStatus(
      stripeEventId,
      {
        processing_status: "processed",
        processed_at: input.processedAt ?? new Date().toISOString(),
        purchase_id: input.purchaseId ?? null,
        last_error_code: null,
        error_message: null,
      },
      supabase,
    );
  },

  async markFailed(
    stripeEventId: string,
    input: {
      lastErrorCode?: string | null;
      errorMessage?: string | null;
      purchaseId?: string | null;
    },
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<StripeWebhookEvent> {
    return updateProcessingStatus(
      stripeEventId,
      {
        processing_status: "failed",
        processed_at: new Date().toISOString(),
        last_error_code: input.lastErrorCode ?? null,
        error_message: input.errorMessage ?? null,
        purchase_id: input.purchaseId ?? null,
      },
      supabase,
    );
  },

  async markIgnored(
    stripeEventId: string,
    input: {
      processedAt?: string;
    } = {},
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<StripeWebhookEvent> {
    return updateProcessingStatus(
      stripeEventId,
      {
        processing_status: "ignored",
        processed_at: input.processedAt ?? new Date().toISOString(),
      },
      supabase,
    );
  },
};
