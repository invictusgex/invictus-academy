import { AdminEnrollmentsRepository } from "@/lib/repositories/admin-enrollments.repository";
import type {
  AdminAssignableProduct,
  AdminEnrollment,
  EnrollmentMutationResult,
  GrantEnrollmentInput,
  ReactivateEnrollmentInput,
  RevokeEnrollmentInput,
  UpdateEnrollmentExpirationInput,
} from "@/lib/types/admin-enrollments.types";

const genericMutationError =
  "No fue posible actualizar el acceso administrativo.";

function hasValue(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function normalizeExpiration(value: string | null | undefined) {
  const trimmedValue = value?.trim();

  return trimmedValue ? new Date(trimmedValue).toISOString() : null;
}

function validateRequiredId(value: string, fieldName: string) {
  if (!value.trim()) {
    throw new Error(`${fieldName} es requerido.`);
  }
}

function validateFutureExpiration(value: string | null) {
  if (!value) {
    return;
  }

  const time = new Date(value).getTime();

  if (Number.isNaN(time)) {
    throw new Error("La fecha de vencimiento no es valida.");
  }

  if (time <= Date.now()) {
    throw new Error("La fecha de vencimiento debe ser futura.");
  }
}

function toMutationError(error: unknown): EnrollmentMutationResult {
  if (error instanceof Error && hasValue(error.message)) {
    return {
      error: error.message,
      ok: false,
    };
  }

  return {
    error: genericMutationError,
    ok: false,
  };
}

async function reactivateEnrollment(
  enrollment: AdminEnrollment,
  expiresAt: string | null,
): Promise<AdminEnrollment> {
  return AdminEnrollmentsRepository.updateEnrollment(enrollment.id, {
    expiresAt,
    revokedAt: null,
    status: "active",
  });
}

export const AdminEnrollmentsService = {
  async listAssignableProducts(): Promise<AdminAssignableProduct[]> {
    return AdminEnrollmentsRepository.listAssignableProducts();
  },

  async getStudentEnrollments(userId: string): Promise<AdminEnrollment[]> {
    validateRequiredId(userId, "userId");

    return AdminEnrollmentsRepository.listStudentEnrollments(userId);
  },

  async grantAccess(
    input: GrantEnrollmentInput,
  ): Promise<EnrollmentMutationResult> {
    try {
      validateRequiredId(input.userId, "userId");
      validateRequiredId(input.productId, "productId");

      const expiresAt = normalizeExpiration(input.expiresAt);

      validateFutureExpiration(expiresAt);

      const existingEnrollment =
        await AdminEnrollmentsRepository.getEnrollmentByUserAndProduct(
          input.userId,
          input.productId,
        );

      if (!existingEnrollment) {
        const enrollment = await AdminEnrollmentsRepository.createEnrollment({
          expiresAt,
          productId: input.productId,
          profileId: input.userId,
          startsAt: new Date().toISOString(),
        });

        return { enrollment, ok: true };
      }

      if (existingEnrollment.status !== "active" || existingEnrollment.revokedAt) {
        const enrollment = await reactivateEnrollment(
          existingEnrollment,
          expiresAt,
        );

        return { enrollment, ok: true };
      }

      if (expiresAt !== existingEnrollment.expiresAt) {
        const enrollment = await AdminEnrollmentsRepository.updateEnrollment(
          existingEnrollment.id,
          { expiresAt, revokedAt: null, status: "active" },
        );

        return { enrollment, ok: true };
      }

      return { enrollment: existingEnrollment, ok: true };
    } catch (error) {
      return toMutationError(error);
    }
  },

  async revokeAccess(
    input: RevokeEnrollmentInput,
  ): Promise<EnrollmentMutationResult> {
    try {
      validateRequiredId(input.enrollmentId, "enrollmentId");

      const existingEnrollment =
        await AdminEnrollmentsRepository.getEnrollmentById(input.enrollmentId);

      if (!existingEnrollment) {
        throw new Error("El acceso solicitado no existe.");
      }

      if (existingEnrollment.status === "revoked" && existingEnrollment.revokedAt) {
        return { enrollment: existingEnrollment, ok: true };
      }

      const enrollment = await AdminEnrollmentsRepository.updateEnrollment(
        input.enrollmentId,
        {
          revokedAt: new Date().toISOString(),
          status: "revoked",
        },
      );

      return { enrollment, ok: true };
    } catch (error) {
      return toMutationError(error);
    }
  },

  async reactivateAccess(
    input: ReactivateEnrollmentInput,
  ): Promise<EnrollmentMutationResult> {
    try {
      validateRequiredId(input.enrollmentId, "enrollmentId");

      const expiresAt = normalizeExpiration(input.expiresAt);

      validateFutureExpiration(expiresAt);

      const existingEnrollment =
        await AdminEnrollmentsRepository.getEnrollmentById(input.enrollmentId);

      if (!existingEnrollment) {
        throw new Error("El acceso solicitado no existe.");
      }

      const enrollment = await reactivateEnrollment(existingEnrollment, expiresAt);

      return { enrollment, ok: true };
    } catch (error) {
      return toMutationError(error);
    }
  },

  async updateExpiration(
    input: UpdateEnrollmentExpirationInput,
  ): Promise<EnrollmentMutationResult> {
    try {
      validateRequiredId(input.enrollmentId, "enrollmentId");

      const expiresAt = normalizeExpiration(input.expiresAt);

      validateFutureExpiration(expiresAt);

      const existingEnrollment =
        await AdminEnrollmentsRepository.getEnrollmentById(input.enrollmentId);

      if (!existingEnrollment) {
        throw new Error("El acceso solicitado no existe.");
      }

      const enrollment = await AdminEnrollmentsRepository.updateEnrollment(
        input.enrollmentId,
        {
          expiresAt,
          revokedAt:
            existingEnrollment.status === "active"
              ? null
              : existingEnrollment.revokedAt,
          status: existingEnrollment.status,
        },
      );

      return { enrollment, ok: true };
    } catch (error) {
      return toMutationError(error);
    }
  },
};
