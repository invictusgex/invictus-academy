import { getSupabaseClient } from "@/lib/database/client";
import type {
  Enrollment,
  EnrollmentAccessSource,
  EnrollmentStatus,
  ProgramAccessInput,
} from "@/lib/types/enrollment.types";

type EnrollmentRow = {
  id: string;
  profile_id: string;
  product_id: string;
  status: EnrollmentStatus;
  access_source: EnrollmentAccessSource;
  starts_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};

type ProductRow = {
  id: string;
};

const enrollmentSelect = `
  id,
  profile_id,
  product_id,
  status,
  access_source,
  starts_at,
  expires_at,
  revoked_at,
  created_at,
  updated_at
`;

function mapEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    profileId: row.profile_id,
    productId: row.product_id,
    status: row.status,
    accessSource: row.access_source,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// El repository es la unica capa de enrollment que conoce Supabase y nombres SQL.
// La UI consulta acceso por slug de producto, sin depender de UUIDs ni tablas.
export const EnrollmentRepository = {
  async getEnrollmentForProduct(
    input: ProgramAccessInput,
  ): Promise<Enrollment | null> {
    const supabase = getSupabaseClient();

    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("slug", input.productSlug)
      .maybeSingle();

    if (productError) {
      throw productError;
    }

    const product = productData as ProductRow | null;

    if (!product) {
      return null;
    }

    const { data, error } = await supabase
      .from("enrollments")
      .select(enrollmentSelect)
      .eq("profile_id", input.userId)
      .eq("product_id", product.id)
      .maybeSingle();

    const enrollment = data as EnrollmentRow | null;

    if (error) {
      throw error;
    }

    return enrollment ? mapEnrollment(enrollment) : null;
  },

  async getEnrollments(userId: string): Promise<Enrollment[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("enrollments")
      .select(enrollmentSelect)
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data as unknown as EnrollmentRow[] | null)?.map(mapEnrollment) ?? [];
  },
};
