import type { CommercialPromotion } from "@/lib/types/promotion.types";

export const primaryCommercialPromotionId = "academy-primary-offer";

export const defaultCommercialPromotion: CommercialPromotion = {
  checkoutDescription:
    "Antes de continuar al pago seguro, recuerda aplicar el cupón vigente dentro de Stripe Checkout.",
  checkoutInstruction:
    "En la pantalla de Stripe, busca el campo de código promocional y escribe GEX10 para acceder a la academia con el descuento aplicado.",
  checkoutTitle: "Descuento disponible",
  code: "GEX10",
  discountLabel: "350 USD de descuento",
  endsAt: null,
  headline: "Cupón de descuento de 350 USD para acceder a la academia",
  id: primaryCommercialPromotionId,
  isActive: true,
  message: "Cupón de descuento de 350 USD para acceder a la academia",
  startsAt: null,
  updatedAt: new Date(0).toISOString(),
};
