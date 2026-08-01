export type MentorshipOutcome = {
  bookingId: string;
  createdAt: string;
  enrollmentId: string;
  id: string;
  nextSteps: string | null;
  productId: string;
  profileId: string;
  resources: string | null;
  sharedAt: string | null;
  sharedBy: string | null;
  summary: string | null;
  updatedAt: string;
};

export type MentorshipOutcomeUpsertInput = {
  bookingId: string;
  nextSteps: string | null;
  resources: string | null;
  sharedBy: string;
  summary: string | null;
};
