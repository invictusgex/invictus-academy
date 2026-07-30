import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  FulfillmentErrorCode,
  FulfillmentOutcome,
  FulfillmentResult,
} from "@/lib/types/commercial.types";

const fulfillmentOutcomes = new Set<FulfillmentOutcome>([
  "granted",
  "already_fulfilled",
  "active_enrollment_reused",
]);

export const permanentFulfillmentErrorCodes = new Set<FulfillmentErrorCode>([
  "PURCHASE_NOT_FOUND",
  "PURCHASE_NOT_PAID",
  "ENROLLMENT_LINK_CONFLICT",
  "ENROLLMENT_REVOKED_CONFLICT",
  "ENROLLMENT_EXPIRED_CONFLICT",
  "ENROLLMENT_NOT_YET_ACTIVE_CONFLICT",
]);

export const retryableFulfillmentErrorCodes = new Set<FulfillmentErrorCode>([
  "ENROLLMENT_CREATION_FAILED",
  "ENROLLMENT_LINK_FAILED",
  "FULFILLMENT_TRANSACTION_FAILED",
  "DATABASE_UNAVAILABLE",
]);

type FulfillPaidPurchaseRpcRow = {
  enrollment_created: boolean;
  enrollment_id: string;
  event_created: boolean;
  outcome: string;
  purchase_id: string;
};

export class CommercialFulfillmentError extends Error {
  readonly code: FulfillmentErrorCode;
  readonly isPermanent: boolean;
  readonly purchaseId: string | null;

  constructor(
    code: FulfillmentErrorCode,
    options: {
      cause?: unknown;
      purchaseId?: string | null;
    } = {},
  ) {
    super(code);
    this.name = "CommercialFulfillmentError";
    this.code = code;
    this.cause = options.cause;
    this.isPermanent = permanentFulfillmentErrorCodes.has(code);
    this.purchaseId = options.purchaseId ?? null;
  }
}

function isFulfillmentErrorCode(value: string): value is FulfillmentErrorCode {
  return (
    permanentFulfillmentErrorCodes.has(value as FulfillmentErrorCode) ||
    retryableFulfillmentErrorCodes.has(value as FulfillmentErrorCode)
  );
}

function toFulfillmentError(error: unknown, purchaseId: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    const message = (error as { message: string }).message;

    if (isFulfillmentErrorCode(message)) {
      return new CommercialFulfillmentError(message, {
        cause: error,
        purchaseId,
      });
    }
  }

  return new CommercialFulfillmentError("DATABASE_UNAVAILABLE", {
    cause: error,
    purchaseId,
  });
}

function mapFulfillmentResult(row: FulfillPaidPurchaseRpcRow): FulfillmentResult {
  if (!fulfillmentOutcomes.has(row.outcome as FulfillmentOutcome)) {
    throw new CommercialFulfillmentError("FULFILLMENT_TRANSACTION_FAILED", {
      purchaseId: row.purchase_id,
    });
  }

  return {
    enrollmentCreated: row.enrollment_created,
    enrollmentId: row.enrollment_id,
    eventCreated: row.event_created,
    outcome: row.outcome as FulfillmentOutcome,
    purchaseId: row.purchase_id,
  };
}

export const CommercialFulfillmentService = {
  async fulfillPaidPurchase(purchaseId: string): Promise<FulfillmentResult> {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.rpc("fulfill_paid_purchase", {
      p_purchase_id: purchaseId,
    });

    if (error) {
      throw toFulfillmentError(error, purchaseId);
    }

    const row = Array.isArray(data) ? data[0] : null;

    if (!row) {
      throw new CommercialFulfillmentError("FULFILLMENT_TRANSACTION_FAILED", {
        purchaseId,
      });
    }

    return mapFulfillmentResult(row);
  },
};
