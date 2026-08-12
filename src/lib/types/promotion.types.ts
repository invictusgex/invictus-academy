export type CommercialPromotion = {
  checkoutDescription: string;
  checkoutInstruction: string;
  checkoutTitle: string;
  code: string;
  discountLabel: string;
  endsAt: string | null;
  headline: string;
  id: string;
  isActive: boolean;
  message: string;
  startsAt: string | null;
  updatedAt: string;
};

export type CommercialPromotionInput = {
  checkoutDescription: string;
  checkoutInstruction: string;
  checkoutTitle: string;
  code: string;
  discountLabel: string;
  endsAt: string | null;
  headline: string;
  isActive: boolean;
  message: string;
  startsAt: string | null;
};

export type CommercialPromotionMutationResult =
  | {
      ok: true;
      promotion: CommercialPromotion;
    }
  | {
      error: string;
      ok: false;
    };
