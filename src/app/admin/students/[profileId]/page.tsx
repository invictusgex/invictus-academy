import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { ProfileRepository } from "@/lib/repositories/profile.repository";
export default async function StudentDetail({ params }: { params: Promise<{ profileId: string }> }) {
  const { supabase } = await requireAdminServerContext();
  const { profileId } = await params;
  const profile = await ProfileRepository.getById(supabase, profileId);
  if (!profile) notFound();
  const { data: payments, error } = await supabase.from("purchases").select("purchase_number,status,amount_total_minor,amount_refunded_minor,currency").eq("profile_id", profileId).order("created_at", { ascending: false });
  if (error) throw new Error("No se pudo consultar el historial comercial.");
  return <div className="space-y-6"><h1 className="text-3xl font-semibold">{profile.fullName || "Alumno"}</h1><p className="break-all">{profile.email}</p><div className="flex flex-wrap gap-5"><Link className="text-[var(--color-cyan)]" href="/admin/mentorship">Agenda y cierre del acompañamiento</Link><Link className="text-[var(--color-cyan)]" href="/admin/access">Gestionar acceso</Link></div><h2 className="text-xl font-semibold">Historial de compras y reembolsos</h2><ul className="divide-y divide-[var(--color-border)]">{payments?.map(payment => <li className="space-y-2 py-4 text-sm" key={payment.purchase_number}><p>{payment.purchase_number} · {payment.status}</p><p>{(payment.amount_total_minor ?? 0) / 100} {payment.currency} · Reembolsado: {payment.amount_refunded_minor / 100} {payment.currency}</p></li>)}</ul></div>;
}
