import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getMentorshipNotice(bookingId: string) {
  const db = getSupabaseAdminClient();
  const { data: booking, error } = await db.from("academy_mentorship_bookings")
    .select("id,status,profile_id,slot_id,booked_at,participant_note,participant_timezone").eq("id", bookingId).maybeSingle();
  if (error) throw new Error("MENTORSHIP_NOTICE_UNAVAILABLE");
  if (!booking || booking.status !== "confirmed") return null;
  const [slotResult, profileResult] = await Promise.all([
    db.from("academy_mentorship_slots").select("starts_at,ends_at,timezone").eq("id", booking.slot_id).single(),
    db.from("profiles").select("full_name,email").eq("id", booking.profile_id).single(),
  ]);
  if (slotResult.error || profileResult.error) throw new Error("MENTORSHIP_NOTICE_UNAVAILABLE");
  const slot = slotResult.data;
  const clean = (value: string | null, limit = 254) => (value || "No indicado").replace(/[\r\n\u0000-\u001f]/g, " ").slice(0, limit);
  const format = (date: string, zone: string) => new Intl.DateTimeFormat("es", { dateStyle: "full", timeStyle: "short", timeZone: zone }).format(new Date(date));
  const zone = "America/Chicago";
  const duration = Math.round((new Date(slot.ends_at).getTime() - new Date(slot.starts_at).getTime()) / 60000);
  const text = `Nueva mentoría agendada\nAlumno: ${clean(profileResult.data.full_name, 100)}\nCorreo: ${clean(profileResult.data.email)}\nEstado: Confirmada\nInicio: ${format(slot.starts_at, zone)}\nFin: ${format(slot.ends_at, zone)}\nZona del administrador: ${zone}\nDuración: ${duration} minutos\nZona del horario: ${clean(slot.timezone, 80)}\nHorario del alumno: ${format(slot.starts_at, booking.participant_timezone)} (${clean(booking.participant_timezone, 80)})\nReservada el: ${format(booking.booked_at, zone)}\nNota del alumno (hasta 400 caracteres): ${clean(booking.participant_note, 400)}\n\nAgenda y detalles completos: https://invictusgex.com/admin/mentorship\nConsulta el panel si la reserva cambia después de este aviso.`;
  return { text, startsAt: slot.starts_at, endsAt: slot.ends_at };
}
