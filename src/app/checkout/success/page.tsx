import { redirect } from "next/navigation";

import { CheckoutSuccessPage } from "@/components/checkout/CheckoutSuccessPage";
import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import { requireServerAuthContext } from "@/lib/auth/server";
import { getActiveEnrollmentProducts } from "@/lib/services/enrollment.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActiveEnrollmentProduct } from "@/lib/types/enrollment.types";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessRoute() {
  let products: ActiveEnrollmentProduct[] = [];

  try {
    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    products = await getActiveEnrollmentProducts(profile.id, supabase);
  } catch (error) {
    if (
      error instanceof ServerAuthError &&
      error.code === SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED
    ) {
      redirect("/login");
    }

    products = [];
  }

  return <CheckoutSuccessPage products={products} />;
}
