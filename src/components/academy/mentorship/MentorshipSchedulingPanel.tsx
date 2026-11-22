"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { isMentorshipBookingDateAllowed } from "@/lib/services/mentorship-booking-window";
import type { MentorshipBooking, MentorshipSlot } from "@/lib/types/mentorship-scheduling.types";
import type { MentorshipOutcome } from "@/lib/types/mentorship-outcome.types";

type Props = { bookings: MentorshipBooking[]; slots: MentorshipSlot[]; requirementsSatisfied: boolean; outcomes?: MentorshipOutcome[] };
const button = "min-h-11 rounded-lg border border-[var(--color-border)] px-5 py-3 text-sm font-semibold disabled:opacity-50";
const input = "min-h-12 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] px-3 py-2 text-white";
const subscribeTimezone = () => () => {};
const browserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago";
const serverTimezone = () => "America/Chicago";
export function MentorshipSchedulingPanel(props: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [bookings, setBookings] = useState(props.bookings);
  const [slots, setSlots] = useState(props.slots);
  const detectedZone = useSyncExternalStore(subscribeTimezone, browserTimezone, serverTimezone);
  const [chosenZone, setZone] = useState<string | null>(null);
  const zone = chosenZone ?? detectedZone;
  const [selected, setSelected] = useState("");
  const [day, setDay] = useState("");
  const [monthChoice, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const format = (date: string) => new Intl.DateTimeFormat("es", { dateStyle: "full", timeStyle: "short", timeZone: zone }).format(new Date(date));
  const current = bookings.find(booking => booking.status === "confirmed");
  const zones = [...new Set(["America/Chicago", "UTC", zone, ...Intl.supportedValuesOf("timeZone")])];
  const dayKey = (value: string) => new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
  const available = slots.filter(slot => slot.status === "available" && isMentorshipBookingDateAllowed(slot.startsAt)).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const months = [...new Set(available.map(slot => dayKey(slot.startsAt).slice(0, 7)))];
  const month = months.includes(monthChoice) ? monthChoice : months[0] ?? "";
  const monthDate = new Date(`${month || "2000-01"}-01T12:00:00Z`);
  const offset = (monthDate.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)).getUTCDate();
  const availableDays = new Set(available.map(slot => dayKey(slot.startsAt)));
  const daySlots = available.filter(slot => dayKey(slot.startsAt) === day);
  const time = (value: string) => new Intl.DateTimeFormat("es", { timeStyle: "short", timeZone: zone }).format(new Date(value));

  async function open() {
    setError(""); setDay(""); setSelected(""); setNote("");
    dialog.current?.showModal();
    setLoading(true);
    try {
      const response = await fetch("/api/academy/mentorship-scheduling", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error?.message || "No se pudo consultar la disponibilidad.");
      setSlots(data.slots); setBookings(data.bookings);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo conectar."); }
    finally { setLoading(false); }
  }

  async function act(method: "POST" | "DELETE") {
    if (pending || (method === "POST" && !daySlots.some(slot => slot.id === selected))) return;
    setPending(true); setError("");
    try {
      const response = await fetch("/api/academy/mentorship-scheduling", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(method === "POST" ? { slotId: selected, participantTimezone: zone, participantNote: note } : { bookingId: current?.id }) });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error?.message || "No se pudo actualizar la reserva.");
      if (data.bookings) setBookings(data.bookings);
      else if (data.booking) setBookings(previous => [...previous.filter(item => item.id !== data.booking.id), data.booking]);
      if (data.slots) setSlots(data.slots);
      setSelected(""); setDay("");
      if (method === "POST") dialog.current?.close();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo conectar."); }
    finally { setPending(false); }
  }

  return <section id="agenda" className="space-y-5 border-t border-[var(--color-border)] pt-7">
    <h2 className="text-2xl font-semibold">{current ? "Próxima sesión" : "Tu agenda"}</h2>
    <p className="text-sm leading-7 text-[var(--color-text-secondary)]">Encuentros de hasta dos horas, con una reserva confirmada a la vez. Las nuevas reservas son desde el día siguiente en America/Chicago.</p>
    {current ? <div className="space-y-4 border-l-2 border-cyan-400 pl-5"><p className="font-semibold">Confirmada</p><p>{current.slotStartsAt ? format(current.slotStartsAt) : "Consulta el horario con el mentor"}</p>{current.slotEndsAt && <p className="text-sm text-[var(--color-text-secondary)]">Fin: {format(current.slotEndsAt)}</p>}{current.participantNote && <p className="whitespace-pre-wrap break-words text-sm">{current.participantNote}</p>}<button disabled={pending} onClick={() => void act("DELETE")} className={button}>{pending ? "Actualizando…" : "Cancelar reserva"}</button></div>
      : !props.requirementsSatisfied ? <p className="text-sm text-[var(--color-text-secondary)]">El acompañamiento está finalizado. Contacta con el mentor si necesitas revisar su estado.</p>
      : <button onClick={() => void open()} className={`${button} bg-[var(--color-cyan)] text-[#051019]`}>Agendar mentoría</button>}
    {error && <p role="alert" className="text-amber-300">{error}</p>}
    <dialog ref={dialog} aria-labelledby="agenda-title" onCancel={event => { if (pending) event.preventDefault(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[#0b1720] p-5 text-white shadow-xl backdrop:bg-black/75 sm:p-7">
      <div className="flex items-center justify-between gap-4"><h2 id="agenda-title" className="text-2xl font-semibold">Agendar mentoría</h2><button autoFocus type="button" aria-label="Cerrar agenda" title="Cerrar agenda" disabled={pending} onClick={() => dialog.current?.close()} className="h-11 w-11 shrink-0 text-2xl disabled:opacity-50">×</button></div>
      {current ? <p className="mt-5">Ya tienes una reserva confirmada. Cierra la agenda para consultarla.</p> : <form className="mt-6 space-y-5" onSubmit={event => { event.preventDefault(); void act("POST"); }}>
        <label className="block space-y-2 text-sm">Tu zona horaria<select className={input} value={zone} disabled={pending || loading} onChange={event => { setZone(event.target.value); setDay(""); setSelected(""); setMonth(""); }}>{zones.map(value => <option key={value}>{value}</option>)}</select></label>
        {loading ? <p role="status">Consultando horarios disponibles…</p> : months.length ? <>
          <label className="block space-y-2 text-sm">Mes<select className={input} value={month} disabled={pending} onChange={event => { setMonth(event.target.value); setDay(""); setSelected(""); }}>{months.map(value => <option key={value} value={value}>{new Intl.DateTimeFormat("es", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T12:00:00Z`))}</option>)}</select></label>
          <fieldset disabled={pending}><legend className="mb-3 font-semibold">Elige un día</legend><div className="grid grid-cols-7 gap-1 text-center text-sm">
            {["L", "M", "X", "J", "V", "S", "D"].map((label, index) => <span key={index} className="py-2 text-[var(--color-text-secondary)]">{label}</span>)}
            {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => { const value = `${month}-${String(index + 1).padStart(2, "0")}`; return <button key={value} type="button" aria-label={new Intl.DateTimeFormat("es", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`))} aria-pressed={day === value} disabled={!availableDays.has(value)} onClick={() => { setDay(value); setSelected(""); }} className={`h-11 min-w-0 rounded border text-sm disabled:border-transparent disabled:text-gray-600 ${day === value ? "border-cyan-400 bg-cyan-400 text-black" : "border-[var(--color-border)]"}`}>{index + 1}</button>; })}
          </div></fieldset>
          {day && <fieldset disabled={pending}><legend className="mb-3 font-semibold">Horarios disponibles</legend><div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{daySlots.map(slot => <label key={slot.id} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${selected === slot.id ? "border-cyan-400 bg-cyan-400/10" : "border-[var(--color-border)]"}`}><input type="radio" name="slot" required checked={selected === slot.id} onChange={() => setSelected(slot.id)} className="accent-cyan-400" /><span>{time(slot.startsAt)} – {time(slot.endsAt)}</span></label>)}</div></fieldset>}
          {selected && <><p className="text-sm text-cyan-300">{format(daySlots.find(slot => slot.id === selected)!.startsAt)} · {zone}</p><label className="block space-y-2 text-sm">Nota para el mentor (opcional)<textarea className={input} rows={3} maxLength={4000} disabled={pending} value={note} onChange={event => setNote(event.target.value)} /></label></>}
          <button disabled={pending || !selected} className={`${button} w-full bg-[var(--color-cyan)] text-[#051019]`}>{pending ? "Reservando…" : "Confirmar reserva"}</button>
        </> : <p role="status" className="leading-7 text-[var(--color-text-secondary)]">No hay horarios disponibles por ahora. El mentor debe habilitar nuevas fechas en su agenda.</p>}
      </form>}
      {error && <p role="alert" className="mt-5 text-amber-300">{error}</p>}
    </dialog>
  </section>;
}
