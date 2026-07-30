import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database, Json } from "@/lib/supabase/database.types";
import type {
  CreatePurchaseEventInput,
  PurchaseEvent,
  PurchaseEventSource,
  PurchaseEventType,
} from "@/lib/types/commercial.types";

type PurchaseEventRow = Database["public"]["Tables"]["purchase_events"]["Row"];
type PurchaseEventInsert =
  Database["public"]["Tables"]["purchase_events"]["Insert"];

const purchaseEventSelect = `
  id,
  purchase_id,
  event_type,
  source,
  actor_profile_id,
  occurred_at,
  summary,
  metadata,
  created_at
`;

function mapPurchaseEvent(row: PurchaseEventRow): PurchaseEvent {
  return {
    id: row.id,
    purchaseId: row.purchase_id,
    eventType: mapPurchaseEventType(row.event_type),
    source: mapPurchaseEventSource(row.source),
    actorProfileId: row.actor_profile_id,
    occurredAt: row.occurred_at,
    summary: row.summary,
    metadata: mapJsonObject(row.metadata),
    createdAt: row.created_at,
  };
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
      throw new Error(`metadata.${key} must be JSON serializable.`);
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

function mapPurchaseEventType(eventType: string): PurchaseEventType {
  if (
    eventType === "purchase_created" ||
    eventType === "payment_pending" ||
    eventType === "payment_confirmed" ||
    eventType === "payment_failed" ||
    eventType === "purchase_canceled" ||
    eventType === "refund_requested" ||
    eventType === "refund_completed" ||
    eventType === "partial_refund_completed" ||
    eventType === "dispute_opened" ||
    eventType === "dispute_won" ||
    eventType === "dispute_lost" ||
    eventType === "enrollment_granted" ||
    eventType === "enrollment_revoked" ||
    eventType === "manual_adjustment"
  ) {
    return eventType;
  }

  throw new Error(`Unexpected purchase event type: ${eventType}.`);
}

function mapPurchaseEventSource(source: string): PurchaseEventSource {
  if (
    source === "system" ||
    source === "stripe_webhook" ||
    source === "admin" ||
    source === "student"
  ) {
    return source;
  }

  throw new Error(`Unexpected purchase event source: ${source}.`);
}

export const PurchaseEventRepository = {
  async listByPurchaseId(
    purchaseId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<PurchaseEvent[]> {
    const { data, error } = await supabase
      .from("purchase_events")
      .select(purchaseEventSelect)
      .eq("purchase_id", purchaseId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data?.map(mapPurchaseEvent) ?? [];
  },

  async create(
    input: CreatePurchaseEventInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<PurchaseEvent> {
    const purchaseEventInsert = {
      purchase_id: input.purchaseId,
      event_type: input.eventType,
      source: input.source,
      actor_profile_id: input.actorProfileId ?? null,
      occurred_at: input.occurredAt ?? new Date().toISOString(),
      summary: input.summary ?? null,
      metadata: toJsonObject(input.metadata),
    } satisfies PurchaseEventInsert;

    const { data, error } = await supabase
      .from("purchase_events")
      .insert(purchaseEventInsert)
      .select(purchaseEventSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapPurchaseEvent(data);
  },
};
