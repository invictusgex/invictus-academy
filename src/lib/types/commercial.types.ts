export const paymentProviders = ["stripe"] as const;

export type PaymentProvider = (typeof paymentProviders)[number];

export const purchaseStatuses = [
  "pending",
  "paid",
  "failed",
  "canceled",
  "refunded",
  "partially_refunded",
  "disputed",
] as const;

export type PurchaseStatus = (typeof purchaseStatuses)[number];

export const purchaseEventTypes = [
  "purchase_created",
  "payment_pending",
  "payment_confirmed",
  "payment_failed",
  "purchase_canceled",
  "refund_requested",
  "refund_completed",
  "partial_refund_completed",
  "dispute_opened",
  "dispute_won",
  "dispute_lost",
  "enrollment_granted",
  "enrollment_revoked",
  "manual_adjustment",
] as const;

export type PurchaseEventType = (typeof purchaseEventTypes)[number];

export const purchaseEventSources = [
  "system",
  "stripe_webhook",
  "admin",
  "student",
] as const;

export type PurchaseEventSource = (typeof purchaseEventSources)[number];

export const webhookProcessingStatuses = [
  "received",
  "processing",
  "processed",
  "failed",
  "ignored",
] as const;

export type WebhookProcessingStatus =
  (typeof webhookProcessingStatuses)[number];

export type Purchase = {
  id: string;
  purchaseNumber: string;
  profileId: string;
  productId: string;
  enrollmentId: string | null;
  status: PurchaseStatus;
  paymentProvider: PaymentProvider;
  providerCheckoutSessionId: string | null;
  providerPaymentIntentId: string | null;
  amountTotalMinor: number | null;
  amountRefundedMinor: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseEvent = {
  id: string;
  purchaseId: string;
  eventType: PurchaseEventType;
  source: PurchaseEventSource;
  actorProfileId: string | null;
  occurredAt: string;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type StripeWebhookEvent = {
  id: string;
  stripeEventId: string;
  eventType: string;
  apiVersion: string | null;
  livemode: boolean;
  processingStatus: WebhookProcessingStatus;
  attemptCount: number;
  lastErrorCode: string | null;
  purchaseId: string | null;
  receivedAt: string;
  processedAt: string | null;
  errorMessage: string | null;
  payloadSummary: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePurchaseInput = {
  profileId: string;
  productId: string;
  enrollmentId?: string | null;
  paymentProvider?: PaymentProvider;
  providerCheckoutSessionId?: string | null;
  providerPaymentIntentId?: string | null;
  amountTotalMinor?: number | null;
  amountRefundedMinor?: number;
  currency?: string;
  status?: PurchaseStatus;
};

export type UpdatePurchaseStatusInput = {
  purchaseId: string;
  status: PurchaseStatus;
};

export type UpdatePurchaseRefundInput = {
  purchaseId: string;
  status: Extract<PurchaseStatus, "partially_refunded" | "refunded">;
  amountRefundedMinor: number;
};

export type AttachProviderCheckoutSessionInput = {
  purchaseId: string;
  providerCheckoutSessionId: string;
  providerPaymentIntentId?: string | null;
};

export type AttachProviderPaymentIntentInput = {
  purchaseId: string;
  providerPaymentIntentId: string;
};

export type CreatePurchaseEventInput = {
  purchaseId: string;
  eventType: PurchaseEventType;
  source: PurchaseEventSource;
  actorProfileId?: string | null;
  occurredAt?: string;
  summary?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CreateStripeWebhookEventInput = {
  stripeEventId: string;
  eventType: string;
  apiVersion?: string | null;
  livemode: boolean;
  processingStatus?: WebhookProcessingStatus;
  purchaseId?: string | null;
  receivedAt?: string;
  processedAt?: string | null;
  attemptCount?: number;
  lastErrorCode?: string | null;
  errorMessage?: string | null;
  payloadSummary?: Record<string, unknown> | null;
};

export const fulfillmentOutcomes = [
  "granted",
  "already_fulfilled",
  "active_enrollment_reused",
] as const;

export type FulfillmentOutcome = (typeof fulfillmentOutcomes)[number];

export const fulfillmentErrorCodes = [
  "PURCHASE_NOT_FOUND",
  "PURCHASE_NOT_PAID",
  "ENROLLMENT_LINK_CONFLICT",
  "ENROLLMENT_REVOKED_CONFLICT",
  "ENROLLMENT_EXPIRED_CONFLICT",
  "ENROLLMENT_NOT_YET_ACTIVE_CONFLICT",
  "ENROLLMENT_CREATION_FAILED",
  "ENROLLMENT_LINK_FAILED",
  "FULFILLMENT_TRANSACTION_FAILED",
  "DATABASE_UNAVAILABLE",
] as const;

export type FulfillmentErrorCode = (typeof fulfillmentErrorCodes)[number];

export type FulfillmentResult = {
  purchaseId: string;
  enrollmentId: string;
  outcome: FulfillmentOutcome;
  enrollmentCreated: boolean;
  eventCreated: boolean;
};
