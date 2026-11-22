"use client";
import { useState, useSyncExternalStore } from "react";
import type { MentorshipBooking, MentorshipSlot } from "@/lib/types/mentorship-scheduling.types";
import type { MentorshipOutcome } from "@/lib/types/mentorship-outcome.types";

type Props = { bookings: MentorshipBooking[]; slots: MentorshipSlot[]; requirementsSatisfied: boolean; outcomes?: MentorshipOutcome[] };
const button = "min-h-11 rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm font-semibold disabled:opacity-50";
const input = "min-h-12 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-2 text-white";
const subscribeTimezone = () => () => {};
const browserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago";
const serverTimezone = () => "America/Chicago";
export function MentorshipSchedulingPanel(props: Props) {
  const [bookings, setBookings] = useState(props.bookings);
  const [slots, setSlots] = useState(props.slots);
  const detectedZone = useSyncExternalStore(subscribeTimezone, browserTimezone, serverTimezone);
  const [chosenZone, setZone] = useState<string | null>(null);
  const zone = chosenZone ?? detectedZone;
  const [selected, setSelected] = useState(props.slots[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const format = (date: string) => new Intl.DateTimeFormat("es", { dateStyle: "full", timeStyle: "short", timeZone: zone }).format(new Date(date));
  const current = bookings.find(booking => booking.status === "confirmed");
  const zones = [...new Set(["America/Chicago", "UTC", zone, ...Intl.supportedValuesOf("timeZone")])];

  async function act(method: "POST" | "DELETE") {
    if (pending) return;
    setPending(true); setError("");
    try {
      const response = await fetch("/api/academy/mentorship-scheduling", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(method === "POST" ? { slotId: selected, participantTimezone: zone, participantNote: note } : { bookingId: current?.id }) });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error?.message || "No se pudo actualizar la reserva.");
      if (data.bookings) setBookings(data.bookings);
      if (data.slots) { setSlots(data.slots); setSelected(data.slots[0]?.id ?? ""); }
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo conectar."); }
    finally { setPending(false); }
  }

  return <section id="agenda" className="space-y-5 border-t border-[var(--color-border)] pt-7">
    <h2 className="text-2xl font-semibold">{current ? "Próxima sesión" : "Reservar una sesión"}</h2>
    <p className="text-sm leading-7 text-[var(--color-text-secondary)]">Coordina la fecha y la duración con el mentor. Una reserva confirmada a la vez; podrás continuar con más sesiones mientras el acompañamiento esté activo. Las nuevas reservas son desde el día siguiente en America/Chicago.</p>
    <label className="block max-w-xl space-y-2 text-sm">Tu zona horaria<select aria-label="Tu zona horaria" className={input} value={zone} onChange={event => setZone(event.target.value)}>{zones.map(value => <option key={value}>{value}</option>)}</select></label>
    {current ? <div className="space-y-4 border-l-2 border-cyan-400 pl-5"><p className="font-semibold">Confirmada</p><p>{current.slotStartsAt ? format(current.slotStartsAt) : "Consulta el horario con el mentor"}</p>{current.slotEndsAt && <p className="text-sm text-[var(--color-text-secondary)]">Fin: {format(current.slotEndsAt)}</p>}{current.participantNote && <p className="whitespace-pre-wrap break-words text-sm">{current.participantNote}</p>}<button disabled={pending} onClick={() => void act("DELETE")} className={button}>{pending ? "Actualizando…" : "Cancelar reserva"}</button></div>
      : !props.requirementsSatisfied ? <p className="text-sm text-[var(--color-text-secondary)]">El acompañamiento está finalizado. Contacta con el mentor si necesitas revisar su estado.</p>
      : slots.length ? <form className="max-w-xl space-y-5" onSubmit={event => { event.preventDefault(); void act("POST"); }}>
        <label className="block space-y-2 text-sm">Horario disponible<select className={input} required value={selected} onChange={event => setSelected(event.target.value)}>{slots.map(slot => <option key={slot.id} value={slot.id}>{format(slot.startsAt)} · {Math.round((Date.parse(slot.endsAt) - Date.parse(slot.startsAt)) / 60000)} min</option>)}</select></label>
        <label className="block space-y-2 text-sm">Qué quieres trabajar en esta sesión (opcional)<textarea className={input} rows={4} maxLength={4000} value={note} onChange={event => setNote(event.target.value)} /></label>
        <button disabled={pending || !selected} className={`${button} bg-[var(--color-cyan)] text-[#051019]`}>{pending ? "Reservando…" : "Confirmar sesión"}</button>
      </form> : <p className="text-sm leading-7 text-[var(--color-text-secondary)]">No hay horarios futuros disponibles. Contacta con el mentor para acordar la próxima sesión.</p>}
    {error && <p role="alert" className="text-amber-300">{error}</p>}
  </section>;
}
