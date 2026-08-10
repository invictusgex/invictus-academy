import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import {
  passwordRecoveryCookieMaxAge,
  passwordRecoveryCookieName,
  passwordRecoveryCookieValue,
} from "@/lib/auth/password-recovery";
import { getSafeInternalRedirect } from "@/lib/auth/redirects";
import { ProfileRepository } from "@/lib/repositories/profile.repository";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const allowedOtpTypes = new Set(["email", "signup", "recovery"]);

function getEmailOtpType(value: string | null): EmailOtpType | null {
  if (!value || !allowedOtpTypes.has(value)) {
    return null;
  }

  return value as EmailOtpType;
}

function normalizeFullName(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim().replace(/\s+/g, " ")
    : "Estudiante Invictus";
}

function buildRedirect(request: Request, path: string) {
  return new URL(path, request.url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const otpType = getEmailOtpType(requestUrl.searchParams.get("type"));
  const isRecovery = otpType === "recovery";
  const nextPath = getSafeInternalRedirect(
    requestUrl.searchParams.get("next"),
    isRecovery ? "/reset-password" : "/academy",
  );
  const recoveryNextPath =
    isRecovery && nextPath === "/reset-password" ? nextPath : "/reset-password";

  if (isRecovery && !tokenHash) {
    return NextResponse.redirect(buildRedirect(request, "/forgot-password"));
  }

  if (!code && (!tokenHash || !otpType)) {
    return NextResponse.redirect(
      buildRedirect(request, isRecovery ? "/forgot-password" : "/login"),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash ?? "",
        type: otpType as EmailOtpType,
      });

  if (error) {
    return NextResponse.redirect(
      buildRedirect(request, isRecovery ? "/forgot-password" : "/login"),
    );
  }

  const { data } = await supabase.auth.getUser();

  if (data.user && !isRecovery) {
    const adminSupabase = getSupabaseAdminClient();
    await ProfileRepository.upsertStudentProfile(adminSupabase, {
      email: data.user.email ?? "",
      fullName: normalizeFullName(data.user.user_metadata.full_name),
      profileId: data.user.id,
    });
  }

  const response = NextResponse.redirect(
    buildRedirect(request, isRecovery ? recoveryNextPath : nextPath),
  );

  if (isRecovery) {
    response.cookies.set({
      httpOnly: true,
      maxAge: passwordRecoveryCookieMaxAge,
      name: passwordRecoveryCookieName,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: passwordRecoveryCookieValue,
    });
  }

  return response;
}
