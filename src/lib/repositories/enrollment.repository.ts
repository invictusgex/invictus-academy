import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database } from "@/lib/supabase/database.types";
import type {
  ActiveEnrollmentProduct,
  Enrollment,
  EnrollmentAccessSource,
  EnrollmentStatus,
  ProgramAccessInput,
} from "@/lib/types/enrollment.types";

type EnrollmentRow = Database["public"]["Tables"]["enrollments"]["Row"];

type ProductRow = Pick<Database["public"]["Tables"]["products"]["Row"], "id">;

type EnrollmentProductRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "description" | "id" | "slug" | "status" | "title"
>;

type EnrollmentWithProductRow = EnrollmentRow & {
  products: EnrollmentProductRow | EnrollmentProductRow[] | null;
};

type EnrollmentByProductIdInput = {
  profileId: string;
  productId: string;
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

const enrollmentProductSelect = `
  id,
  profile_id,
  product_id,
  status,
  access_source,
  starts_at,
  expires_at,
  revoked_at,
  created_at,
  updated_at,
  products (
    id,
    description,
    slug,
    status,
    title
  )
`;

function mapEnrollment(row: EnrollmentRow): Enrollment {
  return {
    id: row.id,
    profileId: row.profile_id,
    productId: row.product_id,
    status: mapEnrollmentStatus(row.status),
    accessSource: mapEnrollmentAccessSource(row.access_source),
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEnrollmentStatus(status: string): EnrollmentStatus {
  if (status === "active" || status === "revoked" || status === "expired") {
    return status;
  }

  throw new Error(`Unexpected enrollment status: ${status}.`);
}

function mapEnrollmentAccessSource(source: string): EnrollmentAccessSource {
  if (source === "manual" || source === "purchase" || source === "promotion") {
    return source;
  }

  throw new Error(`Unexpected enrollment access source: ${source}.`);
}

function normalizeProduct(
  product: EnrollmentProductRow | EnrollmentProductRow[] | null,
): EnrollmentProductRow | null {
  return Array.isArray(product) ? product[0] ?? null : product;
}

function mapActiveEnrollmentProduct(
  row: EnrollmentWithProductRow,
): ActiveEnrollmentProduct | null {
  const product = normalizeProduct(row.products);

  if (!product || product.status !== "active") {
    return null;
  }

  return {
    enrollmentExpiresAt: row.expires_at,
    enrollmentId: row.id,
    enrollmentStartsAt: row.starts_at,
    productId: product.id,
    productDescription: product.description,
    productSlug: product.slug,
    productStatus: product.status,
    productTitle: product.title,
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

    const product: ProductRow | null = productData;

    if (!product) {
      return null;
    }

    return EnrollmentRepository.getEnrollmentByProductId(
      {
        profileId: input.userId,
        productId: product.id,
      },
      supabase,
    );
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

    return data?.map(mapEnrollment) ?? [];
  },

  async getActiveEnrollmentProducts(
    userId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<ActiveEnrollmentProduct[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("enrollments")
      .select(enrollmentProductSelect)
      .eq("profile_id", userId)
      .eq("status", "active")
      .is("revoked_at", null)
      .lte("starts_at", now)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as EnrollmentWithProductRow[])
      .map(mapActiveEnrollmentProduct)
      .filter((product): product is ActiveEnrollmentProduct =>
        Boolean(product),
      );
  },

  async getEnrollmentByProductId(
    input: EnrollmentByProductIdInput,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<Enrollment | null> {
    const { data, error } = await supabase
      .from("enrollments")
      .select(enrollmentSelect)
      .eq("profile_id", input.profileId)
      .eq("product_id", input.productId)
      .maybeSingle();

    const enrollment: EnrollmentRow | null = data;

    if (error) {
      throw error;
    }

    return enrollment ? mapEnrollment(enrollment) : null;
  },
};
