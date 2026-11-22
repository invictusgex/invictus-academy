import { AcademyShell } from "@/components/layout/academy-shell";
import { AcademyEnrollmentEmptyState } from "@/components/academy/AcademyEnrollmentEmptyState";
import { MentorshipSchedulingPanel } from "@/components/academy/mentorship/MentorshipSchedulingPanel";
import { requireAcademyAuthContext } from "@/app/academy/academy-auth";
import { academyProductSlug } from "@/lib/academy-product";
import { getAcademyEnrollmentAccess } from "@/lib/services/academy-access.service";
import { MentorshipSchedulingService } from "@/lib/services/mentorship-scheduling.service";
import { MentorshipOutcomeService } from "@/lib/services/mentorship-outcome.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupportMailtoHref } from "@/config/site";

export default async function AcademyPage() {
  const { profile } = await requireAcademyAuthContext();
  const db = await createSupabaseServerClient();
  const access = await getAcademyEnrollmentAccess(profile.id, db);
  const product = access.activeProducts.find(item => item.productSlug === academyProductSlug);
  if (!product) return <AcademyShell><AcademyEnrollmentEmptyState /></AcademyShell>;
  const { data: enrollment, error } = await db.from("enrollments").select("mentorship_completed_at").eq("id", product.enrollmentId).single();
  if (error) throw new Error("No se pudo consultar el estado de la mentoría.");
  const completed = Boolean(enrollment.mentorship_completed_at);
  const [allBookings, slots, outcomes] = await Promise.all([
    MentorshipSchedulingService.listStudentBookings(profile.id, db),
    completed ? Promise.resolve([]) : MentorshipSchedulingService.listAvailableSlots(db),
    MentorshipOutcomeService.listSharedOutcomesByProfile(profile.id, db),
  ]);
  const bookings = allBookings.filter(item => item.enrollmentId === product.enrollmentId);
  const past = bookings.filter(item => item.status !== "confirmed");
  const format = (value: string) => new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" }).format(new Date(value));
  return <AcademyShell><div className="space-y-9">
    <header><p className="text-sm font-semibold text-[var(--color-cyan)]">MENTORÍA PRIVADA INVICTUS GEX</p><h1 className="mt-3 text-3xl font-semibold">Hola, {profile.fullName || "bienvenido"}.</h1><p className="mt-4 max-w-2xl leading-8 text-[var(--color-text-secondary)]">{completed ? "Tu acompañamiento ha finalizado. Puedes consultar el historial y los resúmenes compartidos." : "Tu acompañamiento está activo. Coordina con el mentor los encuentros necesarios hasta completar la mentoría."}</p><a className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-[var(--color-border)] px-5 text-sm" href={getSupportMailtoHref("Coordinar mi mentoría privada")}>Contactar al mentor</a></header>
    <MentorshipSchedulingPanel bookings={bookings} slots={slots} requirementsSatisfied={!completed} />
    <section className="border-t border-[var(--color-border)] pt-7"><h2 className="text-2xl font-semibold">Historial y seguimiento</h2>{past.length ? <ul className="mt-5 divide-y divide-[var(--color-border)]">{past.map(booking => { const outcome = outcomes.find(item => item.bookingId === booking.id); return <li className="space-y-3 py-5" key={booking.id}><p className="font-semibold">{booking.slotStartsAt ? format(booking.slotStartsAt) : "Sesión"} · America/Chicago</p><p className="text-sm text-[var(--color-text-secondary)]">{booking.status === "completed" ? "Sesión completada" : booking.status === "no_show" ? "No realizada" : "Cancelada"}</p>{outcome && <div className="space-y-3 whitespace-pre-wrap break-words text-sm leading-7">{outcome.summary && <p><strong>Resumen: </strong>{outcome.summary}</p>}{outcome.nextSteps && <p><strong>Próximos pasos: </strong>{outcome.nextSteps}</p>}{outcome.resources && <p><strong>Material de apoyo: </strong>{outcome.resources}</p>}</div>}</li>; })}</ul> : <p className="mt-5 text-sm text-[var(--color-text-secondary)]">Las sesiones realizadas y el seguimiento que comparta tu mentor aparecerán aquí.</p>}</section>
  </div></AcademyShell>;
}
