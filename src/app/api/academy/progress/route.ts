import { NextResponse } from "next/server";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import { requireServerAuthContext } from "@/lib/auth/server";
import { ProgressRepository } from "@/lib/repositories/progress.repository";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { mapModuleProgressRow } from "@/lib/services/progress.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ModuleProgress } from "@/lib/types/progress.types";

export const runtime = "nodejs";

type ProgressResponseBody =
  | {
      progress: ModuleProgress[];
    }
  | {
      progress: ModuleProgress;
    }
  | {
      error: {
        message: string;
      };
    };

function jsonResponse(body: ProgressResponseBody, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function mapAuthStatus(error: ServerAuthError) {
  if (
    error.code === SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED ||
    error.code === SERVER_AUTH_ERROR_CODES.SESSION_REPLACED
  ) {
    return 401;
  }

  return 500;
}

function getProductSlugFromRequest(request: Request) {
  const url = new URL(request.url);
  const productSlug = url.searchParams.get("productSlug");

  return typeof productSlug === "string" && productSlug.trim()
    ? productSlug.trim()
    : null;
}

async function readProgressPayload(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("INVALID_PROGRESS_REQUEST");
  }

  const payload = (await request.json()) as unknown;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("INVALID_PROGRESS_REQUEST");
  }

  const body = payload as Record<string, unknown>;
  const moduleKey = body.moduleKey;
  const productSlug = body.productSlug;
  const completed = body.completed;

  if (
    typeof moduleKey !== "string" ||
    typeof productSlug !== "string" ||
    completed !== true
  ) {
    throw new Error("INVALID_PROGRESS_REQUEST");
  }

  const normalizedModuleKey = moduleKey.trim();
  const normalizedProductSlug = productSlug.trim();

  if (!normalizedModuleKey || !normalizedProductSlug) {
    throw new Error("INVALID_PROGRESS_REQUEST");
  }

  return {
    moduleKey: normalizedModuleKey,
    productSlug: normalizedProductSlug,
  };
}

export async function GET(request: Request) {
  try {
    const productSlug = getProductSlugFromRequest(request);

    if (!productSlug) {
      return jsonResponse(
        {
          error: {
            message: "No se pudo cargar el progreso del programa.",
          },
        },
        400,
      );
    }

    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    const academyAccess = await getAcademyEnrollmentAccess(profile.id, supabase);
    const activeProduct = academyAccess.activeProducts.find(
      (product) => product.productSlug === productSlug,
    );

    if (!activeProduct) {
      return jsonResponse(
        {
          error: {
            message: "No se encontro un acceso activo para este programa.",
          },
        },
        403,
      );
    }

    const rows = await ProgressRepository.listByProfileAndProduct(
      profile.id,
      activeProduct.productId,
      supabase,
    );

    return jsonResponse(
      {
        progress: rows.map(mapModuleProgressRow),
      },
      200,
    );
  } catch (error) {
    if (error instanceof ServerAuthError) {
      return jsonResponse(
        {
          error: {
            message: "Debes iniciar sesión para consultar tu progreso.",
          },
        },
        mapAuthStatus(error),
      );
    }

    return jsonResponse(
      {
        error: {
          message: "No se pudo cargar el progreso del programa.",
        },
      },
      500,
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await readProgressPayload(request);
    await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    const row = await ProgressRepository.markModuleCompleted(payload, supabase);

    return jsonResponse(
      {
        progress: mapModuleProgressRow(row),
      },
      200,
    );
  } catch (error) {
    if (error instanceof ServerAuthError) {
      return jsonResponse(
        {
          error: {
            message: "Debes iniciar sesión para actualizar tu progreso.",
          },
        },
        mapAuthStatus(error),
      );
    }

    return jsonResponse(
      {
        error: {
          message: "No se pudo actualizar el progreso del módulo.",
        },
      },
      error instanceof Error && error.message === "INVALID_PROGRESS_REQUEST"
        ? 400
        : 500,
    );
  }
}
