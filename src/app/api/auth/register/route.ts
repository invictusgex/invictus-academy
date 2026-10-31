import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { getSafeInternalRedirect } from "@/lib/auth/redirects";
import { ProfileRepository } from "@/lib/repositories/profile.repository";
import {
  checkRateLimit,
  createSimpleRateLimitResponse,
  getRateLimitIdentity,
} from "@/lib/security/rate-limit";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/config/site";
import { createSupabaseRegistrationClient } from "@/lib/supabase/registration";
import { classifyRegistrationError } from "@/lib/auth/registration-errors";

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
      code?: string;
      requestId?: string;
    };

const ambiguousConfirmationMessage =
  "Si esta dirección puede registrarse, recibirás un enlace para confirmar tu cuenta.";
const accountHelpMessage =
  "Si ya utilizaste este correo para registrarte, inicia sesión. Si no recuerdas tu contraseña, puedes recuperarla.";

function confirmationResponse(registered = false) {
  return jsonResponse({ accountHelpMessage, accountHelpTitle: "¿Ya habías creado una cuenta?", message: ambiguousConfirmationMessage,
    status: registered ? "registered" : "confirmation_required", title: "Revisa tu correo" }, 200);
}

function providerFailure(error: unknown) {
  const failure = classifyRegistrationError(error);
  if (failure.kind === "existing_account") return confirmationResponse();
  const requestId = randomUUID();
  // Never log provider messages, emails, names, passwords, tokens or request bodies.
  console.error("[auth:register]", JSON.stringify({ requestId, code: failure.kind, status: failure.status }));
  return jsonResponse({ error: failure.message, code: failure.kind, requestId }, failure.status);
}

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

  try {
    const supabase = createSupabaseRegistrationClient();
    const redirectTo = `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent(next)}`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) return providerFailure(error);

    const isNewIdentity =
      data.user?.identities === undefined || data.user.identities.length > 0;

    if (data.user && isNewIdentity) {
      try {
        await ProfileRepository.upsertStudentProfile(getSupabaseAdminClient(), {
          email,
          fullName,
          profileId: data.user.id,
        });
      } catch {
        const requestId = randomUUID();
        console.error("[auth:register]", JSON.stringify({ requestId, code: "profile_sync_failed", status: 503 }));
        return jsonResponse({ code: "profile_sync_failed", requestId, error: "El servicio recibió el registro, pero no pudo preparar el perfil. Si recibiste un correo de confirmación, consérvalo y contacta con soporte." }, 503);
      }
    }
    return confirmationResponse(Boolean(data.session));
  } catch (error) {
    return providerFailure(error);
  }
}
