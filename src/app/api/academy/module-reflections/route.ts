import { NextResponse } from "next/server";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import { requireServerAuthContext } from "@/lib/auth/server";
import {
  MODULE_REFLECTION_ERROR_CODES,
  ModuleReflectionService,
  ModuleReflectionServiceError,
} from "@/lib/services/module-reflection.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ModuleReflection } from "@/lib/types/module-reflection.types";

export const runtime = "nodejs";

type ModuleReflectionResponseBody =
  | {
      reflection: ModuleReflection | null;
    }
  | {
      attachment: NonNullable<ModuleReflection["attachments"]>[number];
    }
  | {
      ok: true;
    }
  | {
      error: {
        code: string;
        message: string;
      };
    };

const forbiddenReflectionFields = new Set([
  "profileId",
  "profile_id",
  "userId",
  "user_id",
  "enrollmentId",
  "enrollment_id",
  "productId",
  "product_id",
]);

function jsonResponse(body: ModuleReflectionResponseBody, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getRequiredParam(request: Request, name: string) {
  const url = new URL(request.url);
  const value = url.searchParams.get(name)?.trim();

  if (!value) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "No se pudo cargar la reflexion del modulo.",
      400,
    );
  }

  return value;
}

async function readReflectionPayload(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "La solicitud debe enviarse como application/json.",
      400,
    );
  }

  const payload = (await request.json()) as unknown;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "El cuerpo de la solicitud debe ser un objeto JSON.",
      400,
    );
  }

  const body = payload as Record<string, unknown>;
  const forbiddenField = Object.keys(body).find((key) =>
    forbiddenReflectionFields.has(key),
  );

  if (forbiddenField) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "La identidad del estudiante se resuelve exclusivamente en el servidor.",
      400,
    );
  }

  if (
    typeof body.productSlug !== "string" ||
    typeof body.moduleKey !== "string" ||
    typeof body.content !== "string"
  ) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "La solicitud debe incluir productSlug, moduleKey y content.",
      400,
    );
  }

  return {
    content: body.content,
    moduleKey: body.moduleKey,
    productSlug: body.productSlug,
  };
}

async function readAttachmentPayload(request: Request) {
  const formData = await request.formData();
  const productSlug = formData.get("productSlug");
  const moduleKey = formData.get("moduleKey");
  const file = formData.get("file");

  if (
    typeof productSlug !== "string" ||
    typeof moduleKey !== "string" ||
    !(file instanceof File)
  ) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "La solicitud debe incluir productSlug, moduleKey y una imagen.",
      400,
    );
  }

  return {
    file,
    moduleKey,
    productSlug,
  };
}

async function readDeletePayload(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "La solicitud debe enviarse como application/json.",
      400,
    );
  }

  const payload = (await request.json()) as unknown;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "El cuerpo de la solicitud debe ser un objeto JSON.",
      400,
    );
  }

  const body = payload as Record<string, unknown>;
  const forbiddenField = Object.keys(body).find((key) =>
    forbiddenReflectionFields.has(key),
  );

  if (forbiddenField) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "La identidad del estudiante se resuelve exclusivamente en el servidor.",
      400,
    );
  }

  if (
    typeof body.productSlug !== "string" ||
    typeof body.moduleKey !== "string" ||
    typeof body.attachmentId !== "string"
  ) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "La solicitud debe incluir productSlug, moduleKey y attachmentId.",
      400,
    );
  }

  return {
    attachmentId: body.attachmentId,
    moduleKey: body.moduleKey,
    productSlug: body.productSlug,
  };
}

function mapAuthError(error: ServerAuthError) {
  if (error.code === SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED) {
    return new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.ACTIVE_ENROLLMENT_REQUIRED,
      "Debes iniciar sesion para documentar esta reflexion.",
      401,
    );
  }

  return new ModuleReflectionServiceError(
    MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
    "No pudimos validar tu sesion para documentar esta reflexion.",
    500,
  );
}

function mapReflectionError(error: unknown) {
  if (error instanceof ModuleReflectionServiceError) {
    return error;
  }

  if (error instanceof ServerAuthError) {
    return mapAuthError(error);
  }

  return new ModuleReflectionServiceError(
    MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
    "No se pudo procesar la reflexion del modulo.",
    500,
  );
}

export async function GET(request: Request) {
  try {
    const productSlug = getRequiredParam(request, "productSlug");
    const moduleKey = getRequiredParam(request, "moduleKey");
    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    const reflection = await ModuleReflectionService.getModuleReflection(
      {
        moduleKey,
        productSlug,
        profileId: profile.id,
      },
      supabase,
    );

    return jsonResponse({ reflection }, 200);
  } catch (error) {
    const reflectionError = mapReflectionError(error);

    return jsonResponse(
      {
        error: {
          code: reflectionError.code,
          message: reflectionError.message,
        },
      },
      reflectionError.status,
    );
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();

    if (contentType.includes("multipart/form-data")) {
      const payload = await readAttachmentPayload(request);
      const attachment =
        await ModuleReflectionService.uploadModuleReflectionAttachment(
          {
            ...payload,
            profileId: profile.id,
          },
          supabase,
        );

      return jsonResponse({ attachment }, 200);
    }

    const payload = await readReflectionPayload(request);
    const reflection = await ModuleReflectionService.saveModuleReflection(
      {
        ...payload,
        profileId: profile.id,
      },
      supabase,
    );

    return jsonResponse({ reflection }, 200);
  } catch (error) {
    const reflectionError = mapReflectionError(error);

    return jsonResponse(
      {
        error: {
          code: reflectionError.code,
          message: reflectionError.message,
        },
      },
      reflectionError.status,
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = await readDeletePayload(request);
    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();

    await ModuleReflectionService.deleteModuleReflectionAttachment(
      {
        ...payload,
        profileId: profile.id,
      },
      supabase,
    );

    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    const reflectionError = mapReflectionError(error);

    return jsonResponse(
      {
        error: {
          code: reflectionError.code,
          message: reflectionError.message,
        },
      },
      reflectionError.status,
    );
  }
}
