import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const cell = (value: string) => `"${(/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;

export async function GET() {
  await requireAdminServerContext();
  const rows: string[] = ["email,fecha_registro,consentimiento"];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await getSupabaseAdminClient().from("live_room_waitlist").select("email,created_at,consent_version").order("email").range(offset, offset + 999);
    if (error) return new Response("No se pudo exportar la lista.", { status: 503, headers: { "Cache-Control": "no-store" } });
    for (const row of data ?? []) rows.push([row.email, row.created_at, row.consent_version].map(cell).join(","));
    if (!data || data.length < 1000) break;
  }
  return new Response("\uFEFF" + rows.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="interesados-sala-en-vivo.csv"', "Cache-Control": "no-store" } });
}
