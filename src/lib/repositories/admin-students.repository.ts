import { getSupabaseClient } from "@/lib/database/client";

export type AdminStudentProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
};

export type AdminStudentProductRow = {
  id: string;
  slug: string;
  status: string;
  title: string;
};

export type AdminStudentEnrollmentRow = {
  id: string;
  profile_id: string;
  product_id: string;
  status: "active" | "revoked" | "expired";
  starts_at: string;
  created_at: string;
  updated_at: string;
  products: AdminStudentProductRow | AdminStudentProductRow[] | null;
};

export type AdminStudentModuleProgressRow = {
  profile_id: string;
  product_id: string;
  module_key: string;
  status: string;
  progress_percent: number;
  last_seen_at: string | null;
  updated_at: string;
};

export type AdminStudentsListQuery = {
  from: number;
  pageSize: number;
  query: string;
  sortBy: "created_at" | "email" | "full_name";
  sortDirection: "asc" | "desc";
};

const profileSelect = "id, email, full_name, created_at";
const enrollmentSelect = `
  id,
  profile_id,
  product_id,
  status,
  starts_at,
  created_at,
  updated_at,
  products (
    id,
    title,
    slug,
    status
  )
`;
const moduleProgressSelect = `
  profile_id,
  product_id,
  module_key,
  status,
  progress_percent,
  last_seen_at,
  updated_at
`;

export const AdminStudentsRepository = {
  async listProfiles({
    from,
    pageSize,
    query,
    sortBy,
    sortDirection,
  }: AdminStudentsListQuery): Promise<{
    count: number;
    profiles: AdminStudentProfileRow[];
  }> {
    const supabase = getSupabaseClient();
    let request = supabase
      .from("profiles")
      .select(profileSelect, { count: "exact" });

    if (query) {
      request = request.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
    }

    const { count, data, error } = await request
      .order(sortBy, { ascending: sortDirection === "asc" })
      .range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    return {
      count: count ?? 0,
      profiles: (data as unknown as AdminStudentProfileRow[] | null) ?? [],
    };
  },

  async getProfile(userId: string): Promise<AdminStudentProfileRow | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(profileSelect)
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as unknown as AdminStudentProfileRow | null) ?? null;
  },

  async listEnrollments(
    profileIds: string[],
  ): Promise<AdminStudentEnrollmentRow[]> {
    if (profileIds.length === 0) {
      return [];
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(enrollmentSelect)
      .in("profile_id", profileIds)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data as unknown as AdminStudentEnrollmentRow[] | null) ?? [];
  },

  async listModuleProgress(
    profileIds: string[],
  ): Promise<AdminStudentModuleProgressRow[]> {
    if (profileIds.length === 0) {
      return [];
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("module_progress")
      .select(moduleProgressSelect)
      .in("profile_id", profileIds);

    if (error) {
      throw error;
    }

    return (data as unknown as AdminStudentModuleProgressRow[] | null) ?? [];
  },
};
