import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export type ProfileRole = "student" | "admin";

export type Profile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: ProfileRole;
};

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "email" | "full_name" | "id" | "role"
>;

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role === "admin" ? "admin" : "student",
  };
}

export const ProfileRepository = {
  async getById(
    supabase: SupabaseClient<Database>,
    profileId: string,
  ): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", profileId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapProfile(data) : null;
  },

  async upsertStudentProfile(
    supabase: SupabaseClient<Database>,
    input: {
      email: string;
      fullName: string;
      profileId: string;
    },
  ): Promise<Profile> {
    const existingProfile = await ProfileRepository.getById(
      supabase,
      input.profileId,
    );

    if (existingProfile) {
      return existingProfile;
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        email: input.email,
        full_name: input.fullName,
        id: input.profileId,
        role: "student",
      })
      .select("id, email, full_name, role")
      .single();

    if (error) {
      if (error.code === "23505") {
        const profile = await ProfileRepository.getById(supabase, input.profileId);

        if (profile) {
          return profile;
        }
      }

      throw error;
    }

    return mapProfile(data);
  },
};
