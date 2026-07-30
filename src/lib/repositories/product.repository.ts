import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

export type ProductStatus = "draft" | "active" | "archived";

export type Product = {
  id: string;
  slug: string;
  title: string;
  status: ProductStatus;
};

type ProductRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "slug" | "status" | "title"
>;

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status === "active" || row.status === "archived"
      ? row.status
      : "draft",
  };
}

export const ProductRepository = {
  async getBySlug(
    supabase: SupabaseClient<Database>,
    slug: string,
  ): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, title, status")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapProduct(data) : null;
  },
};
