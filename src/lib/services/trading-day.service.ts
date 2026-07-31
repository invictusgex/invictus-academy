import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { academyWorkflowConfig } from "@/config/academy-workflow";
import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { TradingDayRepository } from "@/lib/repositories/trading-day.repository";
import { evaluateEnrollmentAccess } from "@/lib/services/enrollment.service";
import type { Database } from "@/lib/supabase/database.types";
import type {
  TradingDay,
  TradingDayCreateInput,
  TradingDayDeleteInput,
  TradingDaysProgress,
  TradingDayUpdateInput,
} from "@/lib/types/trading-day.types";

export const TRADING_DAY_ERROR_CODES = {
  ACTIVE_ENROLLMENT_REQUIRED: "ACTIVE_ENROLLMENT_REQUIRED",
  DUPLICATE_TRADING_DAY: "DUPLICATE_TRADING_DAY",
  INVALID_TRADING_DAY_PAYLOAD: "INVALID_TRADING_DAY_PAYLOAD",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  TRADING_DAY_NOT_FOUND: "TRADING_DAY_NOT_FOUND",
} as const;

export type TradingDayErrorCode =
  (typeof TRADING_DAY_ERROR_CODES)[keyof typeof TRADING_DAY_ERROR_CODES];

export class TradingDayServiceError extends Error {
  readonly code: TradingDayErrorCode;
  readonly status: number;

  constructor(code: TradingDayErrorCode, message: string, status = 400) {
    super(message);
    this.name = "TradingDayServiceError";
    this.code = code;
    this.status = status;
  }
}

function normalizeSlug(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "productSlug es requerido.",
      400,
    );
  }

  return normalized;
}

function normalizeNotes(value: string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = value.trim();

  return normalized ? normalized : null;
}

function normalizeDate(value: string) {
  const normalized = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "tradingDate debe usar el formato YYYY-MM-DD.",
      400,
    );
  }

  const date = new Date(`${normalized}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || normalized !== date.toISOString().slice(0, 10)) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "tradingDate no es una fecha valida.",
      400,
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  if (normalized > today) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.INVALID_TRADING_DAY_PAYLOAD,
      "No puedes registrar dias de trading futuros.",
      400,
    );
  }

  return normalized;
}

async function resolveActiveScope(
  input: {
    productSlug: string;
    profileId: string;
  },
  supabase: SupabaseClient<Database>,
) {
  const product = await ProductRepository.getBySlug(
    supabase,
    normalizeSlug(input.productSlug),
  );

  if (!product || product.status !== "active") {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.PRODUCT_NOT_FOUND,
      "No encontramos el producto asociado al registro de trading.",
      404,
    );
  }

  const enrollment = await EnrollmentRepository.getEnrollmentByProductId(
    {
      productId: product.id,
      profileId: input.profileId,
    },
    supabase,
  );
  const access = evaluateEnrollmentAccess(enrollment);

  if (!access.hasAccess) {
    throw new TradingDayServiceError(
      TRADING_DAY_ERROR_CODES.ACTIVE_ENROLLMENT_REQUIRED,
      "Necesitas un enrollment activo para registrar dias de trading.",
      403,
    );
  }

  return {
    enrollment: access.enrollment,
    product,
  };
}

export const TradingDayService = {
  async listTradingDays(
    input: {
      productSlug: string;
      profileId: string;
    },
    supabase: SupabaseClient<Database>,
  ): Promise<TradingDay[]> {
    const scope = await resolveActiveScope(input, supabase);

    return TradingDayRepository.listByScope(
      {
        productId: scope.product.id,
        profileId: input.profileId,
      },
      supabase,
    );
  },

  async getTradingDaysProgress(
    input: {
      enrollmentId: string | null;
      productId: string;
      profileId: string;
    },
    supabase?: SupabaseClient<Database>,
  ): Promise<TradingDaysProgress> {
    if (!input.enrollmentId) {
      return {
        registeredTradingDays: 0,
        requiredTradingDays: academyWorkflowConfig.requiredTradingDays,
      };
    }

    const registeredTradingDays =
      await TradingDayRepository.countUniqueTradingDates(
        {
          enrollmentId: input.enrollmentId,
          productId: input.productId,
          profileId: input.profileId,
        },
        supabase,
      );

    return {
      registeredTradingDays,
      requiredTradingDays: academyWorkflowConfig.requiredTradingDays,
    };
  },

  async createTradingDay(
    input: TradingDayCreateInput & {
      profileId: string;
    },
    supabase: SupabaseClient<Database>,
  ): Promise<TradingDay> {
    const scope = await resolveActiveScope(input, supabase);

    return TradingDayRepository.create(
      {
        enrollmentId: scope.enrollment.id,
        notes: normalizeNotes(input.notes),
        productId: scope.product.id,
        profileId: input.profileId,
        tradingDate: normalizeDate(input.tradingDate),
      },
      supabase,
    );
  },

  async updateTradingDay(
    input: TradingDayUpdateInput & {
      profileId: string;
    },
    supabase: SupabaseClient<Database>,
  ): Promise<TradingDay> {
    const scope = await resolveActiveScope(input, supabase);

    return TradingDayRepository.update(
      {
        id: input.id,
        notes: normalizeNotes(input.notes),
        productId: scope.product.id,
        profileId: input.profileId,
        tradingDate: normalizeDate(input.tradingDate ?? ""),
      },
      supabase,
    );
  },

  async deleteTradingDay(
    input: TradingDayDeleteInput & {
      profileId: string;
    },
    supabase: SupabaseClient<Database>,
  ): Promise<void> {
    const scope = await resolveActiveScope(input, supabase);

    await TradingDayRepository.delete(
      {
        id: input.id,
        productId: scope.product.id,
        profileId: input.profileId,
      },
      supabase,
    );
  },
};
