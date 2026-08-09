import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  MentorshipRequirementOverride,
  MentorshipRequirementOverrideInput,
} from "@/lib/types/mentorship-requirement-override.types";

type MentorshipRequirementOverrideRow =
  Database["public"]["Tables"]["academy_mentorship_requirement_overrides"]["Row"];

const overrideSelect = `
  id,
  profile_id,
  product_id,
  enrollment_id,
  practice_requirement_waived_at,
  practice_requirement_waived_by,
  revoked_at,
  revoked_by,
  reason,
  created_at,
  updated_at
`;

function mapOverride(
  row: MentorshipRequirementOverrideRow,
): MentorshipRequirementOverride {
  return {
    createdAt: row.created_at,
    enrollmentId: row.enrollment_id,
    id: row.id,
    practiceRequirementWaivedAt: row.practice_requirement_waived_at,
    practiceRequirementWaivedBy: row.practice_requirement_waived_by,
    productId: row.product_id,
    profileId: row.profile_id,
    reason: row.reason,
    revokedAt: row.revoked_at,
    revokedBy: row.revoked_by,
    updatedAt: row.updated_at,
  };
}

export const MentorshipRequirementOverrideRepository = {
  async getActivePracticeRequirementOverride(
    input: Omit<MentorshipRequirementOverrideInput, "adminProfileId" | "reason">,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipRequirementOverride | null> {
    const { data, error } = await supabase
      .from("academy_mentorship_requirement_overrides")
      .select(overrideSelect)
      .eq("profile_id", input.profileId)
      .eq("product_id", input.productId)
      .eq("enrollment_id", input.enrollmentId)
      .is("revoked_at", null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapOverride(data) : null;
  },

  async upsertPracticeRequirementWaiver(
    input: MentorshipRequirementOverrideInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipRequirementOverride> {
    const { data, error } = await supabase
      .from("academy_mentorship_requirement_overrides")
      .upsert(
        {
          enrollment_id: input.enrollmentId,
          practice_requirement_waived_at: new Date().toISOString(),
          practice_requirement_waived_by: input.adminProfileId,
          product_id: input.productId,
          profile_id: input.profileId,
          reason: input.reason ?? null,
          revoked_at: null,
          revoked_by: null,
        },
        {
          onConflict: "profile_id,product_id,enrollment_id",
        },
      )
      .select(overrideSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapOverride(data);
  },

  async revokePracticeRequirementWaiver(
    input: Omit<MentorshipRequirementOverrideInput, "reason">,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<MentorshipRequirementOverride | null> {
    const { data, error } = await supabase
      .from("academy_mentorship_requirement_overrides")
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: input.adminProfileId,
      })
      .eq("profile_id", input.profileId)
      .eq("product_id", input.productId)
      .eq("enrollment_id", input.enrollmentId)
      .is("revoked_at", null)
      .select(overrideSelect)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapOverride(data) : null;
  },
};
