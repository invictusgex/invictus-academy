export type MentorshipPrivateNote = {
  bookingId: string;
  conceptsToReinforce: string | null;
  createdAt: string;
  createdBy: string;
  enrollmentId: string;
  id: string;
  nextSteps: string | null;
  preparationNotes: string | null;
  productId: string;
  profileId: string;
  resourcesToSend: string | null;
  sessionConclusions: string | null;
  updatedAt: string;
};

export type MentorshipPrivateNoteUpsertInput = {
  bookingId: string;
  conceptsToReinforce: string | null;
  createdBy: string;
  nextSteps: string | null;
  preparationNotes: string | null;
  resourcesToSend: string | null;
  sessionConclusions: string | null;
};
