import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { MentorshipOutcomeRepository } from "@/lib/repositories/mentorship-outcome.repository";
import type { Database } from "@/lib/supabase/database.types";
import type {
  MentorshipOutcome,
  MentorshipOutcomeUpsertInput,
} from "@/lib/types/mentorship-outcome.types";

function assertNonEmpty(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

export const MentorshipOutcomeService = {
  async listAdminOutcomesByBookingIds(
    bookingIds: string[],
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipOutcome[]> {
    return MentorshipOutcomeRepository.listAdminOutcomesByBookingIds(
      bookingIds,
      supabase,
    );
  },

  async listSharedOutcomesByProfile(
    profileId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipOutcome[]> {
    assertNonEmpty(profileId, "MENTORSHIP_PROFILE_REQUIRED");

    return MentorshipOutcomeRepository.listSharedOutcomesByProfile(
      profileId,
      supabase,
    );
  },

  async shareAdminOutcome(
    input: MentorshipOutcomeUpsertInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipOutcome> {
    assertNonEmpty(input.bookingId, "MENTORSHIP_BOOKING_ID_REQUIRED");
    assertNonEmpty(input.sharedBy, "MENTORSHIP_OUTCOME_AUTHOR_REQUIRED");

    return MentorshipOutcomeRepository.upsertAdminOutcome(input, supabase);
  },
};
