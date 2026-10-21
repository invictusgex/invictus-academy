export type LiveRoomAccountRow = {
  profile_id: string;
  livemode: boolean;
  discord_user_id: string | null;
  discord_name: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  paid_through: string | null;
  cancel_at_period_end: boolean;
  checkout_session_id: string | null;
  role_synced: boolean;
  needs_sync: boolean;
  operation_token: string | null;
  operation_until: string | null;
  updated_at: string;
};

export type LiveRoomOffer = { amountUsd: number; description: string; configured: boolean };
