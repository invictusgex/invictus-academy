import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import type {
  Enrollment,
  EnrollmentAccessResult,
  ProgramAccessInput,
} from "@/lib/types/enrollment.types";

function parseEnrollmentDate(value: string, fieldName: string): number {
  const time = new Date(value).getTime();

  if (Number.isNaN(time)) {
    throw new Error(`Invalid enrollment ${fieldName}.`);
  }

  return time;
}

function parseNullableEnrollmentDate(
  value: string | null,
  fieldName: string,
): number | null {
  if (value === null) {
    return null;
  }

  return parseEnrollmentDate(value, fieldName);
}

// Authentication responde quien es el usuario.
// Authorization responde que puede hacer o ver ese usuario.
// Enrollment es la evidencia de acceso comercial a un producto/programa.
export function evaluateEnrollmentAccess(
  enrollment: Enrollment | null,
  now = new Date(),
): EnrollmentAccessResult {
  if (!enrollment) {
    return {
      hasAccess: false,
      enrollment: null,
      reason: "not_found",
    };
  }

  if (enrollment.revokedAt || enrollment.status === "revoked") {
    return {
      hasAccess: false,
      enrollment,
      reason: "revoked",
    };
  }

  if (enrollment.status === "expired") {
    return {
      hasAccess: false,
      enrollment,
      reason: "expired",
    };
  }

  if (enrollment.status !== "active") {
    return {
      hasAccess: false,
      enrollment,
      reason: "inactive",
    };
  }

  const nowTime = now.getTime();

  if (Number.isNaN(nowTime)) {
    throw new Error("Invalid enrollment access evaluation date.");
  }

  const startsAtTime = parseEnrollmentDate(
    enrollment.startsAt,
    "startsAt",
  );
  const expiresAtTime = parseNullableEnrollmentDate(
    enrollment.expiresAt,
    "expiresAt",
  );

  if (startsAtTime > nowTime) {
    return {
      hasAccess: false,
      enrollment,
      reason: "not_started",
    };
  }

  if (expiresAtTime !== null && expiresAtTime <= nowTime) {
    return {
      hasAccess: false,
      enrollment,
      reason: "expired",
    };
  }

  return {
    hasAccess: true,
    enrollment,
    reason: null,
  };
}

export async function getProgramAccess(
  input: ProgramAccessInput,
): Promise<EnrollmentAccessResult> {
  const enrollment = await EnrollmentRepository.getEnrollmentForProduct(input);

  return evaluateEnrollmentAccess(enrollment);
}

export async function hasProgramAccess(
  input: ProgramAccessInput,
): Promise<boolean> {
  const access = await getProgramAccess(input);

  return access.hasAccess;
}

export async function getEnrollments(userId: string): Promise<Enrollment[]> {
  return EnrollmentRepository.getEnrollments(userId);
}
