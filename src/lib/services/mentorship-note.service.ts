import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { MentorshipNoteRepository } from "@/lib/repositories/mentorship-note.repository";
import type { Database } from "@/lib/supabase/database.types";
import type {
  MentorshipPrivateNote,
  MentorshipPrivateNoteUpsertInput,
} from "@/lib/types/mentorship-note.types";

function assertNonEmpty(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export const MentorshipNoteService = {
  async listAdminNotesByBookingIds(
    bookingIds: string[],
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipPrivateNote[]> {
    return MentorshipNoteRepository.listAdminNotesByBookingIds(
      bookingIds,
      supabase,
    );
  },

  async saveAdminNote(
    input: MentorshipPrivateNoteUpsertInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipPrivateNote> {
    assertNonEmpty(input.bookingId, "MENTORSHIP_BOOKING_ID_REQUIRED");
    assertNonEmpty(input.createdBy, "MENTORSHIP_NOTE_AUTHOR_REQUIRED");

    return MentorshipNoteRepository.upsertAdminNote(input, supabase);
  },
};
