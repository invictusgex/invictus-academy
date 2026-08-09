import { NextResponse } from "next/server";

import { getSafeInternalRedirect } from "@/lib/auth/redirects";
import { ProfileRepository } from "@/lib/repositories/profile.repository";
import {
  checkRateLimit,
  createSimpleRateLimitResponse,
  getRateLimitIdentity,
} from "@/lib/security/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/config/site";

export const runtime = "nodejs";

type RegisterResponseBody =
  | {
      accountHelpMessage?: string;
      accountHelpTitle?: string;
      message: string;
      status: "confirmation_required" | "registered";
      title?: string;
    }
  | {
      error: string;
    };

const ambiguousConfirmationMessage =
  "Si esta dirección puede registrarse, recibirás un enlace para confirmar tu cuenta.";
const accountHelpMessage =
  "Si ya utilizaste este correo para registrarte, inicia sesión. Si no recuerdas tu contraseña, puedes recuperarla.";

function jsonResponse(body: RegisterResponseBody, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  return password.length >= 8;
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: `auth:register:${getRateLimitIdentity(request)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return createSimpleRateLimitResponse(
      "Demasiadas solicitudes de registro. Intenta nuevamente en unos minutos.",
      rateLimit.retryAfterSeconds,
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "La solicitud no contiene JSON válido." }, 400);
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonResponse({ error: "La solicitud debe ser un objeto JSON." }, 400);
  }

  const body = payload as Record<string, unknown>;
  const fullName = normalizeText(body.fullName);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const passwordConfirmation =
    typeof body.passwordConfirmation === "string"
      ? body.passwordConfirmation
      : "";
  const next = getSafeInternalRedirect(
    typeof body.next === "string" ? body.next : null,
  );

  if (fullName.length < 2) {
    return jsonResponse({ error: "Ingresa tu nombre completo." }, 400);
  }

  if (!isValidEmail(email)) {
    return jsonResponse({ error: "Ingresa un email válido." }, 400);
  }

  if (!validatePassword(password)) {
    return jsonResponse(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      400,
    );
  }

  if (password !== passwordConfirmation) {
    return jsonResponse({ error: "Las contraseñas no coinciden." }, 400);
  }

  const supabase = getSupabaseAdminClient();
  const redirectTo = `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent(
    next,
  )}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("already registered") ||
      message.includes("already exists") ||
      message.includes("user already")
    ) {
      return jsonResponse(
        {
          accountHelpMessage,
          accountHelpTitle: "¿Ya habías creado una cuenta?",
          message: ambiguousConfirmationMessage,
          status: "confirmation_required",
          title: "Revisa tu correo",
        },
        200,
      );
    }

    return jsonResponse(
      { error: "No pudimos crear la cuenta. Revisa los datos e intenta otra vez." },
      400,
    );
  }

  const isNewIdentity =
    data.user?.identities === undefined || data.user.identities.length > 0;

  if (data.user && isNewIdentity) {
    await ProfileRepository.upsertStudentProfile(supabase, {
      email,
      fullName,
      profileId: data.user.id,
    });
  }

  return jsonResponse(
    {
      accountHelpMessage,
      accountHelpTitle: "¿Ya habías creado una cuenta?",
      message: ambiguousConfirmationMessage,
      status: data.session ? "registered" : "confirmation_required",
      title: "Revisa tu correo",
    },
    200,
  );
}
