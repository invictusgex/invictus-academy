import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function LiveRoomWaitlist() {
  const { data, count, error } = await getSupabaseAdminClient().from("live_room_waitlist").select("email,created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(50);
  return <section className="space-y-4 border-t border-[var(--color-border)] pt-6">
    <h2 className="text-xl font-semibold text-white">Lista de interesados</h2>
    {error ? <p role="alert" className="text-amber-300">No se pudo consultar la lista de interesados. Comprueba su migración.</p> : <>
      <p className="text-sm text-[var(--color-text-secondary)]">{count ?? 0} correos registrados con consentimiento para recibir el aviso de apertura. Se muestran los 50 más recientes.</p>
      <a className="inline-flex min-h-11 items-center rounded-lg border border-[var(--color-border)] px-4 text-sm text-white" href="/admin/live-room/waitlist">Descargar CSV</a>
      <ul className="divide-y divide-[var(--color-border)] text-sm">{data?.map(row => <li className="flex flex-wrap justify-between gap-3 py-3" key={row.email}><span className="break-all">{row.email}</span><span>{new Intl.DateTimeFormat("es", { dateStyle: "medium", timeZone: "America/Chicago" }).format(new Date(row.created_at))}</span></li>)}</ul>
    </>}
  </section>;
}
