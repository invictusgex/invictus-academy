import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminCommercialPromotionPage } from "@/components/admin/commercial/AdminCommercialPromotionPage";

export default async function AdminCommercialRoute() {
  await requireAdminServerContext();

  return <AdminCommercialPromotionPage />;
}
