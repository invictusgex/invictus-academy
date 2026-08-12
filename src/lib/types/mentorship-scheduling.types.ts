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

export type MentorshipAvailabilityRuleStatus = "active" | "inactive";

export type MentorshipBlockedWindowStatus = "active" | "cancelled";

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

export type MentorshipAvailabilityRule = {
  bufferMinutes: number;
  createdAt: string;
  createdBy: string | null;
  dayOfWeek: number;
  endsAtTime: string;
  id: string;
  slotDurationMinutes: number;
  startsAtTime: string;
  status: MentorshipAvailabilityRuleStatus;
  timezone: string;
  updatedAt: string;
};

export type MentorshipBlockedWindow = {
  createdAt: string;
  createdBy: string | null;
  endsAt: string;
  id: string;
  reason: string | null;
  startsAt: string;
  status: MentorshipBlockedWindowStatus;
  timezone: string;
  updatedAt: string;
};

export type MentorshipSlotCreateInput = {
  endsAt: string;
  startsAt: string;
  timezone: string;
};

export type MentorshipAvailabilityRuleCreateInput = {
  bufferMinutes: number;
  createdBy: string;
  dayOfWeek: number;
  endsAtTime: string;
  slotDurationMinutes: number;
  startsAtTime: string;
  timezone: string;
};

export type MentorshipAvailabilityRuleUpdateInput = {
  bufferMinutes: number;
  dayOfWeek: number;
  endsAtTime: string;
  id: string;
  slotDurationMinutes: number;
  startsAtTime: string;
  timezone: string;
};

export type MentorshipAvailabilityRuleStatusUpdateInput = {
  id: string;
  status: MentorshipAvailabilityRuleStatus;
};

export type MentorshipBlockedWindowCreateInput = {
  createdBy: string;
  endsAt: string;
  reason: string | null;
  startsAt: string;
  timezone: string;
};

export type MentorshipBlockedWindowStatusUpdateInput = {
  id: string;
  status: MentorshipBlockedWindowStatus;
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

export type MentorshipSlotGenerationInput = {
  createdBy: string;
  endsOn: string;
  startsOn: string;
};

export type MentorshipSlotGenerationResult = {
  createdSlots: MentorshipSlot[];
  skippedCount: number;
};
