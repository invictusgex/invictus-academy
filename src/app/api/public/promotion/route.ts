import { NextResponse } from "next/server";

import { CommercialPromotionService } from "@/lib/services/commercial-promotion.service";

export async function GET() {
  const promotion = await CommercialPromotionService.getActivePromotion();

  return NextResponse.json({ promotion });
}
