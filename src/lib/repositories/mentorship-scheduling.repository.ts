import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  AdminMentorshipBooking,
  MentorshipBooking,
  MentorshipBookingAdminStatusUpdateInput,
  MentorshipBookingRequest,
  MentorshipBookingStatus,
  MentorshipSlot,
  MentorshipSlotCreateInput,
  MentorshipSlotStatus,
  MentorshipSlotUpdateInput,
} from "@/lib/types/mentorship-scheduling.types";

type MentorshipSlotRow =
  Database["public"]["Tables"]["academy_mentorship_slots"]["Row"];
type MentorshipBookingRow =
  Database["public"]["Tables"]["academy_mentorship_bookings"]["Row"];
type MentorshipBookingWithSlotRow = MentorshipBookingRow & {
  academy_mentorship_slots?: {
    ends_at: string;
    starts_at: string;
    timezone: string;
  } | null;
};
type AdminMentorshipBookingRow = MentorshipBookingWithSlotRow & {
  products?: {
    title: string;
  } | null;
  profiles?: {
    email: string | null;
    full_name: string | null;
  } | null;
};

const slotSelect = `
  id,
  starts_at,
  ends_at,
  timezone,
  status,
  created_by,
  created_at,
  updated_at
`;

const bookingSelect = `
  id,
  slot_id,
  profile_id,
  product_id,
  enrollment_id,
  status,
  participant_timezone,
  participant_note,
  booked_at,
  cancelled_at,
  completed_at,
  created_at,
  updated_at,
  academy_mentorship_slots (
    starts_at,
    ends_at,
    timezone
  )
`;

const adminBookingSelect = `
  ${bookingSelect},
  profiles (
    full_name,
    email
  ),
  products (
    title
  )
`;

const mentorshipSlotStatuses: MentorshipSlotStatus[] = [
  "available",
  "booked",
  "blocked",
  "cancelled",
];

const mentorshipBookingStatuses: MentorshipBookingStatus[] = [
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
];

function mapSlotStatus(status: string): MentorshipSlotStatus {
  if (mentorshipSlotStatuses.includes(status as MentorshipSlotStatus)) {
    return status as MentorshipSlotStatus;
  }

  throw new Error(`UNKNOWN_MENTORSHIP_SLOT_STATUS:${status}`);
}

function mapBookingStatus(status: string): MentorshipBookingStatus {
  if (mentorshipBookingStatuses.includes(status as MentorshipBookingStatus)) {
    return status as MentorshipBookingStatus;
  }

  throw new Error(`UNKNOWN_MENTORSHIP_BOOKING_STATUS:${status}`);
}

function mapSlot(row: MentorshipSlotRow): MentorshipSlot {
  return {
    createdAt: row.created_at,
    createdBy: row.created_by,
    endsAt: row.ends_at,
    id: row.id,
    startsAt: row.starts_at,
    status: mapSlotStatus(row.status),
    timezone: row.timezone,
    updatedAt: row.updated_at,
  };
}

function mapBooking(row: MentorshipBookingWithSlotRow): MentorshipBooking {
  return {
    bookedAt: row.booked_at,
    cancelledAt: row.cancelled_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    enrollmentId: row.enrollment_id,
    id: row.id,
    participantNote: row.participant_note,
    participantTimezone: row.participant_timezone,
    productId: row.product_id,
    profileId: row.profile_id,
    slotEndsAt: row.academy_mentorship_slots?.ends_at ?? null,
    slotId: row.slot_id,
    slotStartsAt: row.academy_mentorship_slots?.starts_at ?? null,
    slotTimezone: row.academy_mentorship_slots?.timezone ?? null,
    status: mapBookingStatus(row.status),
    updatedAt: row.updated_at,
  };
}

function mapAdminBooking(row: AdminMentorshipBookingRow): AdminMentorshipBooking {
  return {
    ...mapBooking(row),
    participantEmail: row.profiles?.email ?? null,
    participantName: row.profiles?.full_name ?? null,
    productTitle: row.products?.title ?? null,
  };
}

function getAdminBookingStatusPatch(
  input: MentorshipBookingAdminStatusUpdateInput,
) {
  const now = new Date().toISOString();

  if (input.status === "cancelled") {
    return {
      cancelled_at: now,
      status: input.status,
    };
  }

  if (input.status === "completed") {
    return {
      completed_at: now,
      status: input.status,
    };
  }

  return {
    status: input.status,
  };
}

export const MentorshipSchedulingRepository = {
  async listAvailableFutureSlots(
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipSlot[]> {
    const { data, error } = await supabase
      .from("academy_mentorship_slots")
      .select(slotSelect)
      .eq("status", "available")
      .gt("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true });

    if (error) {
      throw error;
    }

    return ((data as MentorshipSlotRow[] | null) ?? []).map(mapSlot);
  },

  async listAdminSlots(
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipSlot[]> {
    const { data, error } = await supabase
      .from("academy_mentorship_slots")
      .select(slotSelect)
      .order("starts_at", { ascending: true });

    if (error) {
      throw error;
    }

    return ((data as MentorshipSlotRow[] | null) ?? []).map(mapSlot);
  },

  async getSlotById(
    slotId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipSlot | null> {
    const { data, error } = await supabase
      .from("academy_mentorship_slots")
      .select(slotSelect)
      .eq("id", slotId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapSlot(data) : null;
  },

  async createAdminSlot(
    input: MentorshipSlotCreateInput & {
      createdBy: string;
    },
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipSlot> {
    const { data, error } = await supabase
      .from("academy_mentorship_slots")
      .insert({
        created_by: input.createdBy,
        ends_at: input.endsAt,
        starts_at: input.startsAt,
        status: "available",
        timezone: input.timezone,
      })
      .select(slotSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapSlot(data);
  },

  async updateAdminSlot(
    input: MentorshipSlotUpdateInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipSlot> {
    const { data, error } = await supabase
      .from("academy_mentorship_slots")
      .update({
        ends_at: input.endsAt,
        starts_at: input.startsAt,
        status: input.status,
        timezone: input.timezone,
      })
      .eq("id", input.id)
      .select(slotSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapSlot(data);
  },

  async listBookingsByProfile(
    profileId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipBooking[]> {
    const { data, error } = await supabase
      .from("academy_mentorship_bookings")
      .select(bookingSelect)
      .eq("profile_id", profileId)
      .order("booked_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ((data as MentorshipBookingWithSlotRow[] | null) ?? []).map(
      mapBooking,
    );
  },

  async listAdminBookings(
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<AdminMentorshipBooking[]> {
    const { data, error } = await supabase
      .from("academy_mentorship_bookings")
      .select(adminBookingSelect)
      .order("booked_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ((data as AdminMentorshipBookingRow[] | null) ?? []).map(
      mapAdminBooking,
    );
  },

  async updateAdminBookingStatus(
    input: MentorshipBookingAdminStatusUpdateInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipBooking> {
    const { data, error } = await supabase
      .from("academy_mentorship_bookings")
      .update(getAdminBookingStatusPatch(input))
      .eq("id", input.bookingId)
      .neq("status", "completed")
      .select(bookingSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapBooking(data as MentorshipBookingWithSlotRow);
  },

  async bookSlot(
    input: MentorshipBookingRequest,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipBooking> {
    const { data, error } = await supabase.rpc("book_mentorship_slot", {
      p_note: input.participantNote ?? undefined,
      p_participant_timezone: input.participantTimezone,
      p_slot_id: input.slotId,
    });

    if (error) {
      throw error;
    }

    return mapBooking(data as MentorshipBookingRow);
  },

  async cancelBooking(
    bookingId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipBooking> {
    const { data, error } = await supabase.rpc("cancel_mentorship_booking", {
      p_booking_id: bookingId,
    });

    if (error) {
      throw error;
    }

    return mapBooking(data as MentorshipBookingRow);
  },
};
