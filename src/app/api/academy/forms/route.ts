import { NextResponse } from "next/server";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import { requireServerAuthContext } from "@/lib/auth/server";
import {
  FORM_ERROR_CODES,
  FormService,
  FormServiceError,
} from "@/lib/services/form.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { FormAnswers } from "@/lib/types/form.types";

export const runtime = "nodejs";

type FormsResponseBody =
  | {
      submissionId: string;
    }
  | {
      error: {
        code: string;
        message: string;
      };
    };

const forbiddenFormFields = new Set([
  "profileId",
  "profile_id",
  "userId",
  "user_id",
  "enrollmentId",
  "enrollment_id",
  "productId",
  "product_id",
]);

function jsonResponse(body: FormsResponseBody, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

async function readFormPayload(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    throw new FormServiceError(
      FORM_ERROR_CODES.INVALID_FORM_PAYLOAD,
      "La solicitud debe enviarse como application/json.",
      400,
    );
  }

  const payload = (await request.json()) as unknown;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new FormServiceError(
      FORM_ERROR_CODES.INVALID_FORM_PAYLOAD,
      "El cuerpo de la solicitud debe ser un objeto JSON.",
      400,
    );
  }

  const body = payload as Record<string, unknown>;
  const forbiddenField = Object.keys(body).find((key) =>
    forbiddenFormFields.has(key),
  );

  if (forbiddenField) {
    throw new FormServiceError(
      FORM_ERROR_CODES.INVALID_FORM_PAYLOAD,
      "La identidad del estudiante se resuelve exclusivamente en el servidor.",
      400,
    );
  }

  if (
    typeof body.productSlug !== "string" ||
    typeof body.formSlug !== "string" ||
    !body.answers ||
    typeof body.answers !== "object" ||
    Array.isArray(body.answers)
  ) {
    throw new FormServiceError(
      FORM_ERROR_CODES.INVALID_FORM_PAYLOAD,
      "La solicitud debe incluir productSlug, formSlug y answers.",
      400,
    );
  }

  return {
    answers: body.answers as FormAnswers,
    formSlug: body.formSlug,
    productSlug: body.productSlug,
  };
}

function mapAuthError(error: ServerAuthError) {
  if (error.code === SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED) {
    return new FormServiceError(
      FORM_ERROR_CODES.ACTIVE_ENROLLMENT_REQUIRED,
      "Debes iniciar sesion para responder formularios.",
      401,
    );
  }

  return new FormServiceError(
    FORM_ERROR_CODES.INVALID_FORM_PAYLOAD,
    "No pudimos validar tu sesion para responder el formulario.",
    500,
  );
}

function mapFormError(error: unknown) {
  if (error instanceof FormServiceError) {
    return error;
  }

  if (error instanceof ServerAuthError) {
    return mapAuthError(error);
  }

  return new FormServiceError(
    FORM_ERROR_CODES.INVALID_FORM_PAYLOAD,
    "No pudimos guardar la respuesta del formulario.",
    500,
  );
}

export async function POST(request: Request) {
  try {
    const payload = await readFormPayload(request);
    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    const submission = await FormService.submitForm(
      {
        ...payload,
        profileId: profile.id,
      },
      supabase,
    );

    return jsonResponse(
      {
        submissionId: submission.id,
      },
      200,
    );
  } catch (error) {
    const formError = mapFormError(error);

    return jsonResponse(
      {
        error: {
          code: formError.code,
          message: formError.message,
        },
      },
      formError.status,
    );
  }
}
