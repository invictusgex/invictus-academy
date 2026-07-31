export type TradingDay = {
  id: string;
  profileId: string;
  enrollmentId: string;
  productId: string;
  tradingDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TradingDayCreateInput = {
  productSlug: string;
  tradingDate: string;
  notes?: string | null;
};

export type TradingDayUpdateInput = {
  id: string;
  productSlug: string;
  tradingDate?: string;
  notes?: string | null;
};

export type TradingDayDeleteInput = {
  id: string;
  productSlug: string;
};

export type TradingDaysProgress = {
  requiredTradingDays: number;
  registeredTradingDays: number;
};
