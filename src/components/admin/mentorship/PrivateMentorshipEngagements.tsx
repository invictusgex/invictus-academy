import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminServerContext } from "@/app/admin/admin-auth";

async function changeCompletion(form: FormData) {
  "use server";
  const { supabase } = await requireAdminServerContext();
  const id = String(form.get("enrollmentId") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Identificador no válido.");
  const completed = form.get("completed") === "true";
  if (completed && form.get("confirm") !== "on") throw new Error("Confirma el cierre del acompañamiento.");
  const { error } = await supabase.rpc("set_private_mentorship_completed", { p_enrollment_id: id, p_completed: completed });
  const message = error ? error.message.includes("CONFIRMED_BOOKING_EXISTS") ? "Completa o cancela la sesión confirmada antes de cerrar el acompañamiento." : "No se pudo cambiar el estado del acompañamiento." : completed ? "Acompañamiento finalizado. El historial sigue disponible para el alumno." : "Acompañamiento reabierto. El alumno puede reservar nuevas sesiones.";
  revalidatePath("/admin/mentorship"); revalidatePath("/academy");
  redirect(`/admin/mentorship?message=${encodeURIComponent(message)}`);
}

export async function PrivateMentorshipEngagements() {
  const { supabase } = await requireAdminServerContext();
  const { data: product } = await supabase.from("products").select("id").eq("slug", "trading-basado-en-datos").single();
  if (!product) return null;
  const { data: rows, error, count } = await supabase.from("enrollments").select("id,profile_id,mentorship_completed_at", { count: "exact" }).eq("product_id", product.id).eq("status", "active").is("revoked_at", null).order("created_at", { ascending: false }).limit(100);
  if (error) return <p role="alert" className="text-amber-300">No se pudo consultar el estado de los acompañamientos.</p>;
  const { data: profiles, error: profileError } = rows?.length ? await supabase.from("profiles").select("id,full_name,email").in("id", rows.map(row => row.profile_id)) : { data: [], error: null };
  if (profileError) return <p role="alert" className="text-amber-300">No se pudieron consultar los alumnos.</p>;
  const people = new Map(profiles?.map(profile => [profile.id, profile]));
  return <section className="space-y-4 border-y border-[var(--color-border)] py-6"><h2 className="text-2xl font-semibold">Acompañamientos privados</h2><p className="text-sm leading-7 text-[var(--color-text-secondary)]">Completar una sesión no finaliza la mentoría. Cierra el acompañamiento solo cuando se haya completado la mentoría. Se muestran los 100 accesos activos más recientes de {count ?? 0}.</p><ul className="divide-y divide-[var(--color-border)]">{rows?.map(row => { const person = people.get(row.profile_id); return <li key={row.id} className="space-y-4 py-5"><p className="font-semibold">{person?.full_name || "Alumno"}</p><p className="break-all text-sm">{person?.email}</p><p className="text-sm text-[var(--color-cyan)]">{row.mentorship_completed_at ? "Finalizado" : "En acompañamiento"}</p><form action={changeCompletion} className="space-y-3"><input type="hidden" name="enrollmentId" value={row.id} /><input type="hidden" name="completed" value={row.mentorship_completed_at ? "false" : "true"} />{!row.mentorship_completed_at && <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="confirm" required className="mt-1" />Confirmo que se completó la mentoría de este alumno.</label>}<button className="min-h-11 rounded-lg border border-[var(--color-border)] px-5 text-sm font-semibold">{row.mentorship_completed_at ? "Reabrir acompañamiento" : "Finalizar acompañamiento"}</button></form></li>; })}</ul></section>;
}
