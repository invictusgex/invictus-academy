import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { MentorshipRequirementOverrideRepository } from "@/lib/repositories/mentorship-requirement-override.repository";
import type { Database } from "@/lib/supabase/database.types";
import type {
  MentorshipRequirementOverride,
  MentorshipRequirementOverrideInput,
} from "@/lib/types/mentorship-requirement-override.types";

function validateOverrideInput(input: MentorshipRequirementOverrideInput) {
  if (
    !input.adminProfileId ||
    !input.enrollmentId ||
    !input.productId ||
    !input.profileId
  ) {
    throw new Error("Datos insuficientes para actualizar el requisito.");
  }
}

export const MentorshipRequirementOverrideService = {
  async waivePracticeRequirement(
    input: MentorshipRequirementOverrideInput,
    supabase: SupabaseClient<Database>,
  ): Promise<MentorshipRequirementOverride> {
    validateOverrideInput(input);

    return MentorshipRequirementOverrideRepository.upsertPracticeRequirementWaiver(
      input,
      supabase,
    );
  },

  async revokePracticeRequirementWaiver(
    input: Omit<MentorshipRequirementOverrideInput, "reason">,
    supabase: SupabaseClient<Database>,
  ): Promise<MentorshipRequirementOverride | null> {
    validateOverrideInput(input);

    return MentorshipRequirementOverrideRepository.revokePracticeRequirementWaiver(
      input,
      supabase,
    );
  },
};
