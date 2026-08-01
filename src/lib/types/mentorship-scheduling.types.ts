export type MentorshipSlotStatus =
  | "available"
  | "booked"
  | "blocked"
  | "cancelled";

export type MentorshipBookingStatus =
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export type MentorshipSlot = {
  createdAt: string;
  createdBy: string | null;
  endsAt: string;
  id: string;
  startsAt: string;
  status: MentorshipSlotStatus;
  timezone: string;
  updatedAt: string;
};

export type MentorshipBooking = {
  bookedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  enrollmentId: string;
  id: string;
  participantNote: string | null;
  participantTimezone: string;
  productId: string;
  slotEndsAt: string | null;
  profileId: string;
  slotStartsAt: string | null;
  slotId: string;
  slotTimezone: string | null;
  status: MentorshipBookingStatus;
  updatedAt: string;
};

export type AdminMentorshipBooking = MentorshipBooking & {
  participantEmail: string | null;
  participantName: string | null;
  productTitle: string | null;
};

export type MentorshipSlotCreateInput = {
  endsAt: string;
  startsAt: string;
  timezone: string;
};

export type MentorshipSlotUpdateInput = {
  endsAt?: string;
  id: string;
  startsAt?: string;
  status?: MentorshipSlotStatus;
  timezone?: string;
};

export type MentorshipBookingRequest = {
  participantNote?: string | null;
  participantTimezone: string;
  slotId: string;
};

export type MentorshipBookingAdminStatusUpdateInput = {
  bookingId: string;
  status: Extract<MentorshipBookingStatus, "cancelled" | "completed" | "no_show">;
};
