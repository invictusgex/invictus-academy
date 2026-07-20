import type {
  Enrollment,
  ProgramAccessInput,
} from "@/lib/types/enrollment.types";

// Este repository define el contrato futuro de autorizacion por enrollment.
// La UI futura podra preguntar por acceso sin conocer tablas, Supabase ni pagos.
export const EnrollmentRepository = {
  async hasProgramAccess(
    input: ProgramAccessInput,
  ): Promise<boolean> {
    void input;

    throw new Error(
      "EnrollmentRepository.hasProgramAccess is not implemented yet.",
    );
  },

  async getEnrollments(userId: string): Promise<Enrollment[]> {
    void userId;

    throw new Error(
      "EnrollmentRepository.getEnrollments is not implemented yet.",
    );
  },
};
