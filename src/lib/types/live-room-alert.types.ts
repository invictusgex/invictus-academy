export type LiveRoomAlertRow = {
  id: string;
  kind: string;
  occurred_at: string;
  livemode: boolean;
  sent_at: string | null;
  attempts: number;
  lease_token: string | null;
  lease_until: string | null;
  last_attempt_at: string | null;
  last_failed: boolean;
};
