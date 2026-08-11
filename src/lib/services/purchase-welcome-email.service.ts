import "server-only";

import { getSiteUrl } from "@/config/site";
import { TransactionalEmailService } from "@/lib/email/transactional-email.service";
import { buildPurchaseWelcomeEmail } from "@/lib/email/templates/purchase-welcome-email";
import { ProfileRepository } from "@/lib/repositories/profile.repository";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { PurchaseService } from "@/lib/services/purchase.service";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const PurchaseWelcomeEmailService = {
  async sendForPurchase(purchaseId: string) {
    const supabase = getSupabaseAdminClient();
    const purchase = await PurchaseService.getById(purchaseId, supabase);

    if (!purchase || purchase.status !== "paid") {
      return { sent: false, reason: "purchase_not_paid" as const };
    }

    const profile = await ProfileRepository.getById(
      supabase,
      purchase.profileId,
    );

    if (!profile?.email) {
      return { sent: false, reason: "profile_email_missing" as const };
    }

    const product = await ProductRepository.getById(
      supabase,
      purchase.productId,
    );
    const email = buildPurchaseWelcomeEmail({
      academyUrl: `${getSiteUrl()}/academy`,
      fullName: profile.fullName,
      productTitle: product?.title ?? "Programa de Formación Profesional",
    });

    return TransactionalEmailService.send({
      html: email.html,
      subject: email.subject,
      text: email.text,
      to: profile.email,
    });
  },
};
