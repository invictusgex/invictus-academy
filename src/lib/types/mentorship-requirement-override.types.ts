export type MentorshipRequirementOverride = {
  createdAt: string;
  enrollmentId: string;
  id: string;
  practiceRequirementWaivedAt: string;
  practiceRequirementWaivedBy: string;
  productId: string;
  profileId: string;
  reason: string | null;
  revokedAt: string | null;
  revokedBy: string | null;
  updatedAt: string;
};

export type MentorshipRequirementOverrideInput = {
  adminProfileId: string;
  enrollmentId: string;
  productId: string;
  profileId: string;
  reason?: string | null;
};
