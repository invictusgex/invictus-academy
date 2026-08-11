import { NextResponse } from "next/server";

import { getCurrentServerUser } from "@/lib/auth/server";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentServerUser();

  if (!user) {
    return NextResponse.json(
      {
        hasAcademyProgramAccess: false,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const supabase = await createSupabaseServerClient();
  const academyAccess = await getAcademyEnrollmentAccess(user.id, supabase);

  return NextResponse.json(
    {
      hasAcademyProgramAccess: academyAccess.hasAcademyProgramAccess,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
