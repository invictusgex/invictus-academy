import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import type {
  Enrollment,
  ProgramAccessInput,
} from "@/lib/types/enrollment.types";

// Authentication responde quien es el usuario.
// Authorization responde que puede hacer o ver ese usuario.
// Enrollment es la evidencia de acceso comercial a un producto/programa.
export async function hasProgramAccess(
  input: ProgramAccessInput,
): Promise<boolean> {
  return EnrollmentRepository.hasProgramAccess(input);
}

export async function getEnrollments(userId: string): Promise<Enrollment[]> {
  return EnrollmentRepository.getEnrollments(userId);
}
