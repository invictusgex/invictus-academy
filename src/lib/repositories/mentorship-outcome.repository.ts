import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  MentorshipOutcome,
  MentorshipOutcomeUpsertInput,
} from "@/lib/types/mentorship-outcome.types";

type MentorshipOutcomeRow =
  Database["public"]["Tables"]["academy_mentorship_outcomes"]["Row"];
type MentorshipBookingScopeRow = Pick<
  Database["public"]["Tables"]["academy_mentorship_bookings"]["Row"],
  "enrollment_id" | "id" | "product_id" | "profile_id"
>;

const outcomeSelect = `
  id,
  booking_id,
  profile_id,
  product_id,
  enrollment_id,
  summary,
  next_steps,
  resources,
  shared_by,
  shared_at,
  created_at,
  updated_at
`;

function nullableText(value: string | null) {
  const trimmedValue = value?.trim() ?? "";

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function mapOutcome(row: MentorshipOutcomeRow): MentorshipOutcome {
  return {
    bookingId: row.booking_id,
    createdAt: row.created_at,
    enrollmentId: row.enrollment_id,
    id: row.id,
    nextSteps: row.next_steps,
    productId: row.product_id,
    profileId: row.profile_id,
    resources: row.resources,
    sharedAt: row.shared_at,
    sharedBy: row.shared_by,
    summary: row.summary,
    updatedAt: row.updated_at,
  };
}

export const MentorshipOutcomeRepository = {
  async listAdminOutcomesByBookingIds(
    bookingIds: string[],
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipOutcome[]> {
    if (bookingIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("academy_mentorship_outcomes")
      .select(outcomeSelect)
      .in("booking_id", bookingIds);

    if (error) {
      throw error;
    }

    return ((data as MentorshipOutcomeRow[] | null) ?? []).map(mapOutcome);
  },

  async listSharedOutcomesByProfile(
    profileId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipOutcome[]> {
    const { data, error } = await supabase
      .from("academy_mentorship_outcomes")
      .select(outcomeSelect)
      .eq("profile_id", profileId)
      .not("shared_at", "is", null)
      .order("shared_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ((data as MentorshipOutcomeRow[] | null) ?? []).map(mapOutcome);
  },

  async getBookingScope(
    bookingId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipBookingScopeRow | null> {
    const { data, error } = await supabase
      .from("academy_mentorship_bookings")
      .select("id, profile_id, product_id, enrollment_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as MentorshipBookingScopeRow | null;
  },

  async upsertAdminOutcome(
    input: MentorshipOutcomeUpsertInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipOutcome> {
    const booking = await MentorshipOutcomeRepository.getBookingScope(
      input.bookingId,
      supabase,
    );

    if (!booking) {
      throw new Error("MENTORSHIP_BOOKING_NOT_FOUND");
    }

    const { data, error } = await supabase
      .from("academy_mentorship_outcomes")
      .upsert(
        {
          booking_id: booking.id,
          enrollment_id: booking.enrollment_id,
          next_steps: nullableText(input.nextSteps),
          product_id: booking.product_id,
          profile_id: booking.profile_id,
          resources: nullableText(input.resources),
          shared_at: new Date().toISOString(),
          shared_by: input.sharedBy,
          summary: nullableText(input.summary),
        },
        {
          onConflict: "booking_id",
        },
      )
      .select(outcomeSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapOutcome(data);
  },
};
