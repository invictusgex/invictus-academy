export type MentorshipEmailDeliveryRow = {
  booking_id: string;
  booked_at: string;
  starts_at: string;
  ends_at: string;
  status: "pending" | "sent" | "skipped";
  sent_at: string | null;
  attempts: number;
  last_error: string | null;
  lease_token: string | null;
  lease_until: string | null;
};
