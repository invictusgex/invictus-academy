export type EnrollmentAccessStatus = "active" | "revoked" | "expired";

export type AdminAssignableProduct = {
  id: string;
  slug: string;
  title: string;
};

export type AdminEnrollment = {
  accessSource: "manual" | "purchase" | "promotion";
  createdAt: string;
  expiresAt: string | null;
  id: string;
  product: AdminAssignableProduct | null;
  productId: string;
  profileId: string;
  revokedAt: string | null;
  startsAt: string;
  status: EnrollmentAccessStatus;
  updatedAt: string;
};

export type GrantEnrollmentInput = {
  expiresAt?: string | null;
  productId: string;
  userId: string;
};

export type RevokeEnrollmentInput = {
  enrollmentId: string;
};

export type ReactivateEnrollmentInput = {
  enrollmentId: string;
  expiresAt?: string | null;
};

export type UpdateEnrollmentExpirationInput = {
  enrollmentId: string;
  expiresAt?: string | null;
};

export type EnrollmentMutationResult =
  | {
      enrollment: AdminEnrollment;
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };
