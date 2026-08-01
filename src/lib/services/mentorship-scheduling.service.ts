import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { MentorshipSchedulingRepository } from "@/lib/repositories/mentorship-scheduling.repository";
import type { Database } from "@/lib/supabase/database.types";
import type {
  AdminMentorshipBooking,
  MentorshipBooking,
  MentorshipBookingAdminStatusUpdateInput,
  MentorshipBookingRequest,
  MentorshipSlot,
  MentorshipSlotCreateInput,
  MentorshipSlotUpdateInput,
} from "@/lib/types/mentorship-scheduling.types";

function assertNonEmpty(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

function assertFutureRange(startsAt: string, endsAt: string) {
  const startsAtTime = new Date(startsAt).getTime();
  const endsAtTime = new Date(endsAt).getTime();

  if (!Number.isFinite(startsAtTime) || !Number.isFinite(endsAtTime)) {
    throw new Error("MENTORSHIP_SLOT_INVALID_DATE");
  }

  if (startsAtTime <= Date.now()) {
    throw new Error("MENTORSHIP_SLOT_STARTS_IN_PAST");
  }

  if (endsAtTime <= startsAtTime) {
    throw new Error("MENTORSHIP_SLOT_INVALID_RANGE");
  }
}

export const MentorshipSchedulingService = {
  async listAvailableSlots(
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlot[]> {
    return MentorshipSchedulingRepository.listAvailableFutureSlots(supabase);
  },

  async listAdminSlots(
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlot[]> {
    return MentorshipSchedulingRepository.listAdminSlots(supabase);
  },

  async createAdminSlot(
    input: MentorshipSlotCreateInput & {
      createdBy: string;
    },
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlot> {
    assertNonEmpty(input.createdBy, "MENTORSHIP_SLOT_CREATED_BY_REQUIRED");
    assertNonEmpty(input.timezone, "MENTORSHIP_SLOT_TIMEZONE_REQUIRED");
    assertFutureRange(input.startsAt, input.endsAt);

    return MentorshipSchedulingRepository.createAdminSlot(input, supabase);
  },

  async updateAdminSlot(
    input: MentorshipSlotUpdateInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlot> {
    assertNonEmpty(input.id, "MENTORSHIP_SLOT_ID_REQUIRED");

    if (input.timezone !== undefined) {
      assertNonEmpty(input.timezone, "MENTORSHIP_SLOT_TIMEZONE_REQUIRED");
    }

    if (input.startsAt && input.endsAt) {
      assertFutureRange(input.startsAt, input.endsAt);
    }

    return MentorshipSchedulingRepository.updateAdminSlot(input, supabase);
  },

  async setAdminSlotStatus(
    input: Pick<MentorshipSlotUpdateInput, "id" | "status">,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlot> {
    assertNonEmpty(input.id, "MENTORSHIP_SLOT_ID_REQUIRED");

    if (!input.status) {
      throw new Error("MENTORSHIP_SLOT_STATUS_REQUIRED");
    }

    const slot = await MentorshipSchedulingRepository.getSlotById(
      input.id,
      supabase,
    );

    if (!slot) {
      throw new Error("MENTORSHIP_SLOT_NOT_FOUND");
    }

    if (slot.status === "booked") {
      throw new Error("MENTORSHIP_SLOT_BOOKED_STATUS_LOCKED");
    }

    if (
      input.status === "available" &&
      new Date(slot.startsAt).getTime() <= Date.now()
    ) {
      throw new Error("MENTORSHIP_SLOT_PAST_CANNOT_ENABLE");
    }

    if (input.status === "booked") {
      throw new Error("MENTORSHIP_SLOT_STATUS_BOOKED_RESERVED");
    }

    return MentorshipSchedulingRepository.updateAdminSlot(input, supabase);
  },

  async listStudentBookings(
    profileId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBooking[]> {
    assertNonEmpty(profileId, "MENTORSHIP_PROFILE_REQUIRED");

    return MentorshipSchedulingRepository.listBookingsByProfile(
      profileId,
      supabase,
    );
  },

  async listAdminBookings(
    supabase?: SupabaseClient<Database>,
  ): Promise<AdminMentorshipBooking[]> {
    return MentorshipSchedulingRepository.listAdminBookings(supabase);
  },

  async updateAdminBookingStatus(
    input: MentorshipBookingAdminStatusUpdateInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBooking> {
    assertNonEmpty(input.bookingId, "MENTORSHIP_BOOKING_ID_REQUIRED");

    return MentorshipSchedulingRepository.updateAdminBookingStatus(
      input,
      supabase,
    );
  },

  async bookSlot(
    input: MentorshipBookingRequest,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBooking> {
    assertNonEmpty(input.slotId, "MENTORSHIP_SLOT_ID_REQUIRED");
    assertNonEmpty(
      input.participantTimezone,
      "MENTORSHIP_PARTICIPANT_TIMEZONE_REQUIRED",
    );

    return MentorshipSchedulingRepository.bookSlot(input, supabase);
  },

  async cancelBooking(
    bookingId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBooking> {
    assertNonEmpty(bookingId, "MENTORSHIP_BOOKING_ID_REQUIRED");

    return MentorshipSchedulingRepository.cancelBooking(bookingId, supabase);
  },
};
