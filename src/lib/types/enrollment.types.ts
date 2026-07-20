export type EnrollmentStatus = "active" | "revoked" | "expired";

export type EnrollmentAccessSource = "manual" | "purchase" | "promotion";

export type EnrollmentAccessReason =
  | "not_found"
  | "inactive"
  | "not_started"
  | "expired"
  | "revoked";

export interface Enrollment {
  id: string;
  profileId: string;
  productId: string;
  status: EnrollmentStatus;
  accessSource: EnrollmentAccessSource;
  startsAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProgramAccessInput = {
  userId: string;
  productSlug: string;
};

export type EnrollmentAccessResult =
  | {
      hasAccess: true;
      enrollment: Enrollment;
      reason: null;
    }
  | {
      hasAccess: false;
      enrollment: Enrollment | null;
      reason: EnrollmentAccessReason;
    };
