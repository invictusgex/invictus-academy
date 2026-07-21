import { getSupabaseClient } from "@/lib/database/client";
import type {
  AdminAssignableProduct,
  AdminEnrollment,
  EnrollmentAccessStatus,
} from "@/lib/types/admin-enrollments.types";

type AdminEnrollmentProductRow = {
  id: string;
  slug: string;
  title: string;
};

type AdminEnrollmentRow = {
  access_source: "manual" | "purchase" | "promotion";
  created_at: string;
  expires_at: string | null;
  id: string;
  product_id: string;
  profile_id: string;
  products: AdminEnrollmentProductRow | AdminEnrollmentProductRow[] | null;
  revoked_at: string | null;
  starts_at: string;
  status: EnrollmentAccessStatus;
  updated_at: string;
};

type EnrollmentInsertInput = {
  expiresAt: string | null;
  productId: string;
  profileId: string;
  startsAt: string;
};

type EnrollmentUpdateInput = {
  expiresAt?: string | null;
  revokedAt?: string | null;
  status?: EnrollmentAccessStatus;
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
  updated_at,
  products (
    id,
    title,
    slug
  )
`;

function normalizeProduct(
  product: AdminEnrollmentProductRow | AdminEnrollmentProductRow[] | null,
): AdminAssignableProduct | null {
  const currentProduct = Array.isArray(product) ? product[0] : product;

  if (!currentProduct) {
    return null;
  }

  return {
    id: currentProduct.id,
    slug: currentProduct.slug,
    title: currentProduct.title,
  };
}

function mapEnrollment(row: AdminEnrollmentRow): AdminEnrollment {
  return {
    accessSource: row.access_source,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    id: row.id,
    product: normalizeProduct(row.products),
    productId: row.product_id,
    profileId: row.profile_id,
    revokedAt: row.revoked_at,
    startsAt: row.starts_at,
    status: row.status,
    updatedAt: row.updated_at,
  };
}

function toUpdateRow(input: EnrollmentUpdateInput) {
  const row: {
    expires_at?: string | null;
    revoked_at?: string | null;
    status?: EnrollmentAccessStatus;
  } = {};

  if ("expiresAt" in input) {
    row.expires_at = input.expiresAt;
  }

  if ("revokedAt" in input) {
    row.revoked_at = input.revokedAt;
  }

  if ("status" in input) {
    row.status = input.status;
  }

  return row;
}

export const AdminEnrollmentsRepository = {
  async getEnrollmentByUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<AdminEnrollment | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(enrollmentSelect)
      .eq("profile_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const row = data as unknown as AdminEnrollmentRow | null;

    return row ? mapEnrollment(row) : null;
  },

  async getEnrollmentById(
    enrollmentId: string,
  ): Promise<AdminEnrollment | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(enrollmentSelect)
      .eq("id", enrollmentId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const row = data as unknown as AdminEnrollmentRow | null;

    return row ? mapEnrollment(row) : null;
  },

  async createEnrollment(
    input: EnrollmentInsertInput,
  ): Promise<AdminEnrollment> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .insert({
        access_source: "manual",
        expires_at: input.expiresAt,
        product_id: input.productId,
        profile_id: input.profileId,
        revoked_at: null,
        starts_at: input.startsAt,
        status: "active",
      })
      .select(enrollmentSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapEnrollment(data as unknown as AdminEnrollmentRow);
  },

  async updateEnrollment(
    enrollmentId: string,
    input: EnrollmentUpdateInput,
  ): Promise<AdminEnrollment> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .update(toUpdateRow(input))
      .eq("id", enrollmentId)
      .select(enrollmentSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapEnrollment(data as unknown as AdminEnrollmentRow);
  },

  async listAssignableProducts(): Promise<AdminAssignableProduct[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug")
      .eq("status", "active")
      .order("title", { ascending: true });

    if (error) {
      throw error;
    }

    return (data as unknown as AdminAssignableProduct[] | null) ?? [];
  },

  async listStudentEnrollments(userId: string): Promise<AdminEnrollment[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(enrollmentSelect)
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (
      (data as unknown as AdminEnrollmentRow[] | null)?.map(mapEnrollment) ?? []
    );
  },
};
