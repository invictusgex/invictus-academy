import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  MentorshipPrivateNote,
  MentorshipPrivateNoteUpsertInput,
} from "@/lib/types/mentorship-note.types";

type MentorshipPrivateNoteRow =
  Database["public"]["Tables"]["academy_mentorship_notes"]["Row"];
type MentorshipBookingScopeRow = Pick<
  Database["public"]["Tables"]["academy_mentorship_bookings"]["Row"],
  "enrollment_id" | "id" | "product_id" | "profile_id"
>;

const noteSelect = `
  id,
  booking_id,
  profile_id,
  product_id,
  enrollment_id,
  preparation_notes,
  concepts_to_reinforce,
  session_conclusions,
  next_steps,
  resources_to_send,
  created_by,
  created_at,
  updated_at
`;

function mapNote(row: MentorshipPrivateNoteRow): MentorshipPrivateNote {
  return {
    bookingId: row.booking_id,
    conceptsToReinforce: row.concepts_to_reinforce,
    createdAt: row.created_at,
    createdBy: row.created_by,
    enrollmentId: row.enrollment_id,
    id: row.id,
    nextSteps: row.next_steps,
    preparationNotes: row.preparation_notes,
    productId: row.product_id,
    profileId: row.profile_id,
    resourcesToSend: row.resources_to_send,
    sessionConclusions: row.session_conclusions,
    updatedAt: row.updated_at,
  };
}

function nullableText(value: string | null) {
  const trimmedValue = value?.trim() ?? "";

  return trimmedValue.length > 0 ? trimmedValue : null;
}

export const MentorshipNoteRepository = {
  async listAdminNotesByBookingIds(
    bookingIds: string[],
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipPrivateNote[]> {
    if (bookingIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("academy_mentorship_notes")
      .select(noteSelect)
      .in("booking_id", bookingIds);

    if (error) {
      throw error;
    }

    return ((data as MentorshipPrivateNoteRow[] | null) ?? []).map(mapNote);
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

  async upsertAdminNote(
    input: MentorshipPrivateNoteUpsertInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipPrivateNote> {
    const booking = await MentorshipNoteRepository.getBookingScope(
      input.bookingId,
      supabase,
    );

    if (!booking) {
      throw new Error("MENTORSHIP_BOOKING_NOT_FOUND");
    }

    const { data, error } = await supabase
      .from("academy_mentorship_notes")
      .upsert(
        {
          booking_id: booking.id,
          concepts_to_reinforce: nullableText(input.conceptsToReinforce),
          created_by: input.createdBy,
          enrollment_id: booking.enrollment_id,
          next_steps: nullableText(input.nextSteps),
          preparation_notes: nullableText(input.preparationNotes),
          product_id: booking.product_id,
          profile_id: booking.profile_id,
          resources_to_send: nullableText(input.resourcesToSend),
          session_conclusions: nullableText(input.sessionConclusions),
        },
        {
          onConflict: "booking_id",
        },
      )
      .select(noteSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapNote(data);
  },
};
