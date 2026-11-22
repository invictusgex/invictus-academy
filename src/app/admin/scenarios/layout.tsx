import { redirect } from "next/navigation";
import { requireAdminServerContext } from "@/app/admin/admin-auth";
export default async function ArchivedScenariosLayout() { await requireAdminServerContext(); redirect("/admin/mentorship"); }
