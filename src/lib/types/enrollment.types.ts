export type EnrollmentStatus = "active" | "inactive" | "expired" | "cancelled";

export interface Enrollment {
  id: string;
  profileId: string;
  productId: string;
  status: EnrollmentStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProgramAccessInput = {
  userId: string;
  productSlug: string;
};
