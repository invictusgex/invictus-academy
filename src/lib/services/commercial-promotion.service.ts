import { CommercialPromotionRepository } from "@/lib/repositories/commercial-promotion.repository";
import type {
  CommercialPromotion,
  CommercialPromotionInput,
  CommercialPromotionMutationResult,
} from "@/lib/types/promotion.types";

const genericMutationError = "No fue posible actualizar la promoción vigente.";

class CommercialPromotionInputError extends Error {}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeNullableDate(value: string | null) {
  const normalized = value?.trim();

  return normalized ? new Date(normalized).toISOString() : null;
}

function validateRequiredText(value: string, fieldName: string) {
  if (!value.trim()) {
    throw new CommercialPromotionInputError(`${fieldName} es requerido.`);
  }
}

function validateDateRange(startsAt: string | null, endsAt: string | null) {
  if (!startsAt || !endsAt) {
    return;
  }

  if (new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
    throw new CommercialPromotionInputError(
      "La fecha de inicio debe ser anterior a la fecha de cierre.",
    );
  }
}

function toMutationError(error: unknown): CommercialPromotionMutationResult {
  if (error instanceof CommercialPromotionInputError && error.message) {
    return {
      error: error.message,
      ok: false,
    };
  }

  return {
    error: genericMutationError,
    ok: false,
  };
}

function normalizeInput(
  input: CommercialPromotionInput,
): CommercialPromotionInput {
  validateRequiredText(input.code, "Código");
  validateRequiredText(input.discountLabel, "Tipo de descuento");
  validateRequiredText(input.headline, "Mensaje superior");
  validateRequiredText(input.message, "Mensaje de la cinta");
  validateRequiredText(input.checkoutTitle, "Título de checkout");
  validateRequiredText(input.checkoutDescription, "Descripción de checkout");
  validateRequiredText(input.checkoutInstruction, "Instrucción de checkout");

  const startsAt = normalizeNullableDate(input.startsAt);
  const endsAt = normalizeNullableDate(input.endsAt);

  validateDateRange(startsAt, endsAt);

  return {
    checkoutDescription: normalizeText(input.checkoutDescription),
    checkoutInstruction: normalizeText(input.checkoutInstruction),
    checkoutTitle: normalizeText(input.checkoutTitle),
    code: normalizeText(input.code).toUpperCase(),
    discountLabel: normalizeText(input.discountLabel),
    endsAt,
    headline: normalizeText(input.headline),
    isActive: input.isActive,
    message: normalizeText(input.message),
    startsAt,
  };
}

export const CommercialPromotionService = {
  async getActivePromotion(): Promise<CommercialPromotion | null> {
    return CommercialPromotionRepository.getActivePromotion();
  },

  async getPrimaryPromotionForAdmin(): Promise<CommercialPromotion> {
    return CommercialPromotionRepository.getPrimaryPromotionForAdmin();
  },

  async savePrimaryPromotion(
    input: CommercialPromotionInput,
  ): Promise<CommercialPromotionMutationResult> {
    try {
      const promotion = await CommercialPromotionRepository.upsertPrimaryPromotion(
        normalizeInput(input),
      );

      return { ok: true, promotion };
    } catch (error) {
      return toMutationError(error);
    }
  },
};
