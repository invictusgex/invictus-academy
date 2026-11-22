import { redirect } from "next/navigation";
import { requireAdminServerContext } from "@/app/admin/admin-auth";
export default async function ArchivedContentLayout() { await requireAdminServerContext(); redirect("/admin/mentorship"); }
