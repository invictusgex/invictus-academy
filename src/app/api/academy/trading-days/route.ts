import { NextResponse } from "next/server";

import {
  SERVER_AUTH_ERROR_CODES,
  ServerAuthError,
} from "@/lib/auth/server-errors";
import { requireServerAuthContext } from "@/lib/auth/server";
import {
  TRADING_DAY_ERROR_CODES,
  TradingDayService,
  TradingDayServiceError,
} from "@/lib/services/trading-day.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  TradingDay,
  TradingDayCreateInput,
  TradingDayDeleteInput,
  TradingDayUpdateInput,
} from "@/lib/types/trading-day.types";

export const runtime = "nodejs";

type TradingDaysResponseBody =
  | {
      tradingDays: TradingDay[];
    }
  | {
      tradingDay: TradingDay;
    }
  | {
      deleted: true;
    }
  | {
      error: {
        code: string;
        message: string;
      };
    };

const forbiddenTradingDayFields = new Set([
  "profileId",
  "profile_id",
  "userId",
  "user_id",
  "enrollmentId",
  "enrollment_id",
  "productId",
  "product_id",
]);

function jsonResponse(body: TradingDaysResponseBody, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getRequiredProductSlug(request: Request) {
  const url = new URL(request.url);
  const productSlug = url.searchParams.get("productSlug")?.trim();

  if (!productSlug) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "productSlug es requerido.",
      400,
    );
  }

  return productSlug;
}

async function readJsonPayload(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.includes("application/json")) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "La solicitud debe enviarse como application/json.",
      400,
    );
  }

  const payload = (await request.json()) as unknown;

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "El cuerpo de la solicitud debe ser un objeto JSON.",
      400,
    );
  }

  const body = payload as Record<string, unknown>;
  const forbiddenField = Object.keys(body).find((key) =>
    forbiddenTradingDayFields.has(key),
  );

  if (forbiddenField) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "La identidad del estudiante se resuelve exclusivamente en el servidor.",
      400,
    );
  }

  return body;
}

async function readCreatePayload(
  request: Request,
): Promise<TradingDayCreateInput> {
  const body = await readJsonPayload(request);

  if (
    typeof body.productSlug !== "string" ||
    typeof body.tradingDate !== "string" ||
    (
      body.notes !== undefined &&
      body.notes !== null &&
      typeof body.notes !== "string"
    )
  ) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "La solicitud debe incluir productSlug y tradingDate validos.",
      400,
    );
  }

  return {
    notes: body.notes,
    productSlug: body.productSlug,
    tradingDate: body.tradingDate,
  };
}

async function readUpdatePayload(
  request: Request,
): Promise<TradingDayUpdateInput> {
  const body = await readJsonPayload(request);

  if (
    typeof body.id !== "string" ||
    typeof body.productSlug !== "string" ||
    typeof body.tradingDate !== "string" ||
    (
      body.notes !== undefined &&
      body.notes !== null &&
      typeof body.notes !== "string"
    )
  ) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "La solicitud debe incluir id, productSlug y tradingDate validos.",
      400,
    );
  }

  return {
    id: body.id,
    notes: body.notes,
    productSlug: body.productSlug,
    tradingDate: body.tradingDate,
  };
}

async function readDeletePayload(
  request: Request,
): Promise<TradingDayDeleteInput> {
  const body = await readJsonPayload(request);

  if (typeof body.id !== "string" || typeof body.productSlug !== "string") {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "La solicitud debe incluir id y productSlug validos.",
      400,
    );
  }

  return {
    id: body.id,
    productSlug: body.productSlug,
  };
}

function mapAuthError(error: ServerAuthError) {
  if (error.code === SERVER_AUTH_ERROR_CODES.UNAUTHENTICATED) {
    return new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.ACTIVE_ENROLLMENT_REQUIRED,
      "Debes iniciar sesión para registrar días de trading.",
      401,
    );
  }

  return new TradingDayServiceError(
    TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
    "No pudimos validar tu sesión para registrar días de trading.",
    500,
  );
}

function mapTradingDayError(error: unknown) {
  if (error instanceof TradingDayServiceError) {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "23505"
  ) {
    return new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.DUPLICATE_TRADING_DAY,
      "Ya registraste un dia de trading para esa fecha.",
      409,
    );
  }

  if (error instanceof ServerAuthError) {
    return mapAuthError(error);
  }

  return new TradingDayServiceError(
    TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
    "No pudimos procesar el dia de trading.",
    500,
  );
}

export async function GET(request: Request) {
  try {
    const productSlug = getRequiredProductSlug(request);
    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    const tradingDays = await TradingDayService.listTradingDays(
      {
        productSlug,
        profileId: profile.id,
      },
      supabase,
    );

    return jsonResponse({ tradingDays }, 200);
  } catch (error) {
    const tradingDayError = mapTradingDayError(error);

    return jsonResponse(
      {
        error: {
          code: tradingDayError.code,
          message: tradingDayError.message,
        },
      },
      tradingDayError.status,
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await readCreatePayload(request);
    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    const tradingDay = await TradingDayService.createTradingDay(
      {
        ...payload,
        profileId: profile.id,
      },
      supabase,
    );

    return jsonResponse({ tradingDay }, 201);
  } catch (error) {
    const tradingDayError = mapTradingDayError(error);

    return jsonResponse(
      {
        error: {
          code: tradingDayError.code,
          message: tradingDayError.message,
        },
      },
      tradingDayError.status,
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await readUpdatePayload(request);
    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    const tradingDay = await TradingDayService.updateTradingDay(
      {
        ...payload,
        profileId: profile.id,
      },
      supabase,
    );

    return jsonResponse({ tradingDay }, 200);
  } catch (error) {
    const tradingDayError = mapTradingDayError(error);

    return jsonResponse(
      {
        error: {
          code: tradingDayError.code,
          message: tradingDayError.message,
        },
      },
      tradingDayError.status,
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = await readDeletePayload(request);
    const { profile } = await requireServerAuthContext();
    const supabase = await createSupabaseServerClient();
    await TradingDayService.deleteTradingDay(
      {
        ...payload,
        profileId: profile.id,
      },
      supabase,
    );

    return jsonResponse({ deleted: true }, 200);
  } catch (error) {
    const tradingDayError = mapTradingDayError(error);

    return jsonResponse(
      {
        error: {
          code: tradingDayError.code,
          message: tradingDayError.message,
        },
      },
      tradingDayError.status,
    );
  }
}
