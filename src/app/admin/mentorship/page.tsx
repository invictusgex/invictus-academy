import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/ui/AdminStatusBadge";
import { MentorshipNoteService } from "@/lib/services/mentorship-note.service";
import { MentorshipOutcomeService } from "@/lib/services/mentorship-outcome.service";
import { MentorshipSchedulingService } from "@/lib/services/mentorship-scheduling.service";
import type { MentorshipPrivateNote } from "@/lib/types/mentorship-note.types";
import type { MentorshipOutcome } from "@/lib/types/mentorship-outcome.types";
import type {
  AdminMentorshipBooking,
  MentorshipAvailabilityRule,
  MentorshipAvailabilityRuleStatus,
  MentorshipBlockedWindow,
  MentorshipBlockedWindowStatus,
  MentorshipBookingStatus,
  MentorshipSlot,
  MentorshipSlotStatus,
} from "@/lib/types/mentorship-scheduling.types";

type AdminMentorshipRouteProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

const adminMentorshipPath = "/admin/mentorship";
const defaultMentorshipTimezone = "America/Chicago";
const dayLabels = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function redirectWithMessage(message: string): never {
  redirect(`${adminMentorshipPath}?message=${encodeURIComponent(message)}`);
}

function getOffsetMinutes(timezone: string, instant: Date) {
  const formatter = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: timezone,
    timeZoneName: "shortOffset",
    year: "numeric",
  });
  const timeZoneName =
    formatter
      .formatToParts(instant)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = timeZoneName.match(/^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/);

  if (!match?.[1] || !match[2]) {
    return 0;
  }

  const direction = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");

  return direction * (hours * 60 + minutes);
}

function zonedDateTimeToUtcIso(date: string, time: string, timezone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    throw new Error("Fecha u hora invalida.");
  }

  const approximateUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offsetMinutes = getOffsetMinutes(timezone, approximateUtc);

  return new Date(
    Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000,
  ).toISOString();
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

async function createSlotAction(formData: FormData) {
  "use server";

  const { profile, supabase } = await requireAdminServerContext();
  const date = getString(formData, "date");
  const startsAtTime = getString(formData, "startsAt");
  const endsAtTime = getString(formData, "endsAt");
  const timezone = getString(formData, "timezone");
  let message = "Horario publicado correctamente.";

  try {
    if (!date || !startsAtTime || !endsAtTime || !timezone) {
      throw new Error("Completa fecha, horas y zona horaria.");
    }

    const startsAt = zonedDateTimeToUtcIso(date, startsAtTime, timezone);
    const endsAt = zonedDateTimeToUtcIso(date, endsAtTime, timezone);

    await MentorshipSchedulingService.createAdminSlot(
      {
        createdBy: profile.id,
        endsAt,
        startsAt,
        timezone,
      },
      supabase,
    );
    revalidatePath(adminMentorshipPath);
  } catch (error) {
    message =
      error instanceof Error
        ? error.message
        : "No pudimos publicar el horario.";
  }

  redirectWithMessage(message);
}

async function updateSlotStatusAction(formData: FormData) {
  "use server";

  const { supabase } = await requireAdminServerContext();
  const id = getString(formData, "slotId");
  const status = getString(formData, "status") as MentorshipSlotStatus;
  let message = "Estado del horario actualizado.";

  try {
    await MentorshipSchedulingService.setAdminSlotStatus(
      {
        id,
        status,
      },
      supabase,
    );
    revalidatePath(adminMentorshipPath);
  } catch {
    message = "No pudimos actualizar ese horario.";
  }

  redirectWithMessage(message);
}

async function createAvailabilityRuleAction(formData: FormData) {
  "use server";

  const { profile, supabase } = await requireAdminServerContext();
  const dayOfWeek = Number(getString(formData, "dayOfWeek"));
  const slotDurationMinutes = Number(
    getString(formData, "slotDurationMinutes") || "60",
  );
  const bufferMinutes = Number(getString(formData, "bufferMinutes") || "0");
  let message = "Regla de disponibilidad creada.";

  try {
    await MentorshipSchedulingService.createAvailabilityRule(
      {
        bufferMinutes,
        createdBy: profile.id,
        dayOfWeek,
        endsAtTime: getString(formData, "endsAtTime"),
        slotDurationMinutes,
        startsAtTime: getString(formData, "startsAtTime"),
        timezone: getString(formData, "timezone"),
      },
      supabase,
    );
    revalidatePath(adminMentorshipPath);
  } catch {
    message = "No pudimos crear la regla de disponibilidad.";
  }

  redirectWithMessage(message);
}

async function updateAvailabilityRuleStatusAction(formData: FormData) {
  "use server";

  const { supabase } = await requireAdminServerContext();
  const id = getString(formData, "ruleId");
  const status = getString(
    formData,
    "status",
  ) as MentorshipAvailabilityRuleStatus;
  let message = "Regla de disponibilidad actualizada.";

  try {
    await MentorshipSchedulingService.setAvailabilityRuleStatus(
      {
        id,
        status,
      },
      supabase,
    );
    revalidatePath(adminMentorshipPath);
  } catch {
    message = "No pudimos actualizar esa regla.";
  }

  redirectWithMessage(message);
}

async function createBlockedWindowAction(formData: FormData) {
  "use server";

  const { profile, supabase } = await requireAdminServerContext();
  const date = getString(formData, "blockedDate");
  const startsAtTime = getString(formData, "blockedStartsAt");
  const endsAtTime = getString(formData, "blockedEndsAt");
  const timezone = getString(formData, "blockedTimezone");
  let message = "Bloqueo aplicado al calendario.";

  try {
    if (!date || !startsAtTime || !endsAtTime || !timezone) {
      throw new Error("Completa fecha, horas y zona horaria.");
    }

    await MentorshipSchedulingService.createBlockedWindow(
      {
        createdBy: profile.id,
        endsAt: zonedDateTimeToUtcIso(date, endsAtTime, timezone),
        reason: getString(formData, "reason") || null,
        startsAt: zonedDateTimeToUtcIso(date, startsAtTime, timezone),
        timezone,
      },
      supabase,
    );
    revalidatePath(adminMentorshipPath);
  } catch {
    message = "No pudimos aplicar ese bloqueo.";
  }

  redirectWithMessage(message);
}

async function updateBlockedWindowStatusAction(formData: FormData) {
  "use server";

  const { supabase } = await requireAdminServerContext();
  const id = getString(formData, "blockedWindowId");
  const status = getString(
    formData,
    "status",
  ) as MentorshipBlockedWindowStatus;
  let message = "Bloqueo actualizado.";

  try {
    await MentorshipSchedulingService.setBlockedWindowStatus(
      {
        id,
        status,
      },
      supabase,
    );
    revalidatePath(adminMentorshipPath);
  } catch {
    message = "No pudimos actualizar ese bloqueo.";
  }

  redirectWithMessage(message);
}

async function generateSlotsFromRulesAction(formData: FormData) {
  "use server";

  const { profile, supabase } = await requireAdminServerContext();
  let message = "Calendario generado.";

  try {
    const result = await MentorshipSchedulingService.generateAvailabilitySlots(
      {
        createdBy: profile.id,
        endsOn: getString(formData, "endsOn"),
        startsOn: getString(formData, "startsOn"),
      },
      supabase,
    );

    message = `Se generaron ${result.createdSlots.length} horarios. Se omitieron ${result.skippedCount} por bloqueos, solapamientos o fechas pasadas.`;
    revalidatePath(adminMentorshipPath);
  } catch {
    message = "No pudimos generar el calendario con esas reglas.";
  }

  redirectWithMessage(message);
}

async function updateBookingStatusAction(formData: FormData) {
  "use server";

  const { supabase } = await requireAdminServerContext();
  const bookingId = getString(formData, "bookingId");
  const status = getString(formData, "status") as Extract<
    MentorshipBookingStatus,
    "cancelled" | "completed" | "no_show"
  >;
  let message = "Estado de la reserva actualizado.";

  try {
    await MentorshipSchedulingService.updateAdminBookingStatus(
      {
        bookingId,
        status,
      },
      supabase,
    );
    revalidatePath(adminMentorshipPath);
  } catch {
    message = "No pudimos actualizar esa reserva.";
  }

  redirectWithMessage(message);
}

async function savePrivateNoteAction(formData: FormData) {
  "use server";

  const { profile, supabase } = await requireAdminServerContext();
  const bookingId = getString(formData, "bookingId");
  let message = "Notas actualizadas";

  try {
    await MentorshipNoteService.saveAdminNote(
      {
        bookingId,
        conceptsToReinforce: getString(formData, "conceptsToReinforce"),
        createdBy: profile.id,
        nextSteps: getString(formData, "nextSteps"),
        preparationNotes: getString(formData, "preparationNotes"),
        resourcesToSend: getString(formData, "resourcesToSend"),
        sessionConclusions: getString(formData, "sessionConclusions"),
      },
      supabase,
    );
    revalidatePath(adminMentorshipPath);
  } catch {
    message = "No pudimos guardar las notas privadas.";
  }

  redirectWithMessage(message);
}

async function shareParticipantOutcomeAction(formData: FormData) {
  "use server";

  const { profile, supabase } = await requireAdminServerContext();
  const bookingId = getString(formData, "bookingId");
  let message = "Cierre compartido con el participante.";

  try {
    await MentorshipOutcomeService.shareAdminOutcome(
      {
        bookingId,
        nextSteps: getString(formData, "participantNextSteps"),
        resources: getString(formData, "participantResources"),
        sharedBy: profile.id,
        summary: getString(formData, "participantSummary"),
      },
      supabase,
    );
    revalidatePath(adminMentorshipPath);
    revalidatePath("/academy/mentoria");
  } catch {
    message = "No pudimos compartir el cierre con el participante.";
  }

  redirectWithMessage(message);
}

function formatDateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function getSlotTone(status: MentorshipSlotStatus) {
  if (status === "available") {
    return "success";
  }

  if (status === "booked") {
    return "warning";
  }

  if (status === "cancelled") {
    return "danger";
  }

  return "neutral";
}

function getBookingTone(status: MentorshipBookingStatus) {
  if (status === "confirmed") {
    return "success";
  }

  if (status === "completed") {
    return "neutral";
  }

  if (status === "cancelled") {
    return "danger";
  }

  return "warning";
}

function getAvailabilityRuleTone(status: MentorshipAvailabilityRuleStatus) {
  return status === "active" ? "success" : "neutral";
}

function getBlockedWindowTone(status: MentorshipBlockedWindowStatus) {
  return status === "active" ? "danger" : "neutral";
}

function formatRuleTime(value: string) {
  return value.slice(0, 5);
}

function findBookingForSlot(
  slot: MentorshipSlot,
  bookings: AdminMentorshipBooking[],
) {
  return (
    bookings.find(
      (booking) => booking.slotId === slot.id && booking.status === "confirmed",
    ) ?? null
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4">
      <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </article>
  );
}

function SlotActions({
  isFuture,
  slot,
}: {
  isFuture: boolean;
  slot: MentorshipSlot;
}) {
  if (slot.status === "booked" || !isFuture) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {slot.status === "available" ? (
        <>
          <form action={updateSlotStatusAction}>
            <input name="slotId" type="hidden" value={slot.id} />
            <input name="status" type="hidden" value="blocked" />
            <button className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--color-cyan)]">
              Bloquear
            </button>
          </form>
          <form action={updateSlotStatusAction}>
            <input name="slotId" type="hidden" value={slot.id} />
            <input name="status" type="hidden" value="cancelled" />
            <button className="rounded-full border border-red-200/30 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-200">
              Cancelar slot
            </button>
          </form>
        </>
      ) : null}
      {slot.status === "blocked" ? (
        <form action={updateSlotStatusAction}>
          <input name="slotId" type="hidden" value={slot.id} />
          <input name="status" type="hidden" value="available" />
          <button className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--color-cyan)]">
            Habilitar
          </button>
        </form>
      ) : null}
    </div>
  );
}

function AvailabilityRuleActions({
  rule,
}: {
  rule: MentorshipAvailabilityRule;
}) {
  return (
    <form action={updateAvailabilityRuleStatusAction}>
      <input name="ruleId" type="hidden" value={rule.id} />
      <input
        name="status"
        type="hidden"
        value={rule.status === "active" ? "inactive" : "active"}
      />
      <button className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--color-cyan)]">
        {rule.status === "active" ? "Pausar regla" : "Activar regla"}
      </button>
    </form>
  );
}

function BlockedWindowActions({
  blockedWindow,
}: {
  blockedWindow: MentorshipBlockedWindow;
}) {
  return (
    <form action={updateBlockedWindowStatusAction}>
      <input name="blockedWindowId" type="hidden" value={blockedWindow.id} />
      <input
        name="status"
        type="hidden"
        value={blockedWindow.status === "active" ? "cancelled" : "active"}
      />
      <button className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--color-cyan)]">
        {blockedWindow.status === "active"
          ? "Quitar bloqueo"
          : "Reactivar bloqueo"}
      </button>
    </form>
  );
}

function formatNullableDateTime(value: string | null, timezone: string) {
  return value ? formatDateTime(value, timezone) : null;
}

function BookingActions({ booking }: { booking: AdminMentorshipBooking }) {
  if (booking.status !== "confirmed") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <form action={updateBookingStatusAction}>
        <input name="bookingId" type="hidden" value={booking.id} />
        <input name="status" type="hidden" value="completed" />
        <button className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--color-cyan)]">
          Marcar completed
        </button>
      </form>
      <form action={updateBookingStatusAction}>
        <input name="bookingId" type="hidden" value={booking.id} />
        <input name="status" type="hidden" value="no_show" />
        <button className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--color-cyan)]">
          Marcar no show
        </button>
      </form>
      <form action={updateBookingStatusAction}>
        <input name="bookingId" type="hidden" value={booking.id} />
        <input name="status" type="hidden" value="cancelled" />
        <button className="rounded-full border border-red-200/30 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-200">
          Cancelar reserva
        </button>
      </form>
    </div>
  );
}

function PrivateNotesForm({
  booking,
  note,
}: {
  booking: AdminMentorshipBooking;
  note: MentorshipPrivateNote | null;
}) {
  const completedAt = formatNullableDateTime(
    booking.completedAt,
    booking.participantTimezone,
  );

  return (
    <section className="mt-5 rounded-xl border border-[var(--color-border)] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h4 className="text-base font-semibold text-white">
            Preparación y cierre de mentoría
          </h4>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Estas notas son internas y no son visibles para el participante.
          </p>
          {completedAt ? (
            <p className="mt-2 text-sm text-[var(--color-cyan)]">
              Finalizada: {completedAt}
            </p>
          ) : null}
        </div>
      </div>

      {booking.status === "completed" ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Conclusiones
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-text-secondary)]">
              {note?.sessionConclusions ?? "Sin conclusiones documentadas."}
            </p>
          </div>
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-text-muted)] uppercase">
              Proximos pasos
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-text-secondary)]">
              {note?.nextSteps ?? "Sin próximos pasos documentados."}
            </p>
          </div>
        </div>
      ) : null}

      <form action={savePrivateNoteAction} className="mt-5 grid gap-4">
        <input name="bookingId" type="hidden" value={booking.id} />
        <label className="grid gap-2 text-sm font-semibold text-white">
          Preparación de la sesión
          <textarea
            className="min-h-32 min-w-0 resize-y rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[var(--color-cyan)]"
            defaultValue={note?.preparationNotes ?? ""}
            name="preparationNotes"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-white">
          Conceptos que requieren refuerzo
          <textarea
            className="min-h-32 min-w-0 resize-y rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[var(--color-cyan)]"
            defaultValue={note?.conceptsToReinforce ?? ""}
            name="conceptsToReinforce"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-white">
          Conclusiones
          <textarea
            className="min-h-32 min-w-0 resize-y rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[var(--color-cyan)]"
            defaultValue={note?.sessionConclusions ?? ""}
            name="sessionConclusions"
          />
        </label>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-white">
            Proximos pasos
            <textarea
              className="min-h-32 min-w-0 resize-y rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[var(--color-cyan)]"
              defaultValue={note?.nextSteps ?? ""}
              name="nextSteps"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-white">
            Recursos por enviar
            <textarea
              className="min-h-32 min-w-0 resize-y rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[var(--color-cyan)]"
              defaultValue={note?.resourcesToSend ?? ""}
              name="resourcesToSend"
            />
          </label>
        </div>
        <button className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-black transition hover:bg-white sm:w-fit">
          Guardar notas privadas
        </button>
      </form>
    </section>
  );
}

function ParticipantOutcomeForm({
  booking,
  outcome,
}: {
  booking: AdminMentorshipBooking;
  outcome: MentorshipOutcome | null;
}) {
  return (
    <section className="mt-5 rounded-xl border border-[var(--color-border)] p-4">
      <div className="min-w-0">
        <h4 className="text-base font-semibold text-white">
          Cierre visible para el participante
        </h4>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Este contenido sí será visible para el participante cuando lo
          compartas. No se copia automáticamente desde las notas privadas.
        </p>
        {outcome?.sharedAt ? (
          <p className="mt-2 text-sm text-[var(--color-cyan)]">
            Compartido: {formatDateTime(outcome.sharedAt, booking.participantTimezone)}
          </p>
        ) : null}
      </div>

      <form action={shareParticipantOutcomeAction} className="mt-5 grid gap-4">
        <input name="bookingId" type="hidden" value={booking.id} />
        <label className="grid gap-2 text-sm font-semibold text-white">
          Resumen de la sesión
          <textarea
            className="min-h-56 min-w-0 resize-y rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[var(--color-cyan)]"
            defaultValue={outcome?.summary ?? ""}
            name="participantSummary"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-white">
          Próximos pasos
          <textarea
            className="min-h-56 min-w-0 resize-y rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[var(--color-cyan)]"
            defaultValue={outcome?.nextSteps ?? ""}
            name="participantNextSteps"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-white">
          Recursos recomendados
          <textarea
            className="min-h-56 min-w-0 resize-y rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[var(--color-cyan)]"
            defaultValue={outcome?.resources ?? ""}
            name="participantResources"
          />
        </label>
        <button className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-black transition hover:bg-white sm:w-fit">
          Compartir cierre con el participante
        </button>
      </form>
    </section>
  );
}

export default async function AdminMentorshipRoute({
  searchParams,
}: AdminMentorshipRouteProps) {
  const { supabase } = await requireAdminServerContext();
  const params = await searchParams;
  const [slots, bookings, availabilityRules, blockedWindows] =
    await Promise.all([
    MentorshipSchedulingService.listAdminSlots(supabase),
    MentorshipSchedulingService.listAdminBookings(supabase),
    MentorshipSchedulingService.listAvailabilityRules(supabase),
    MentorshipSchedulingService.listBlockedWindows(supabase),
  ]);
  const notes = await MentorshipNoteService.listAdminNotesByBookingIds(
    bookings.map((booking) => booking.id),
    supabase,
  );
  const outcomes = await MentorshipOutcomeService.listAdminOutcomesByBookingIds(
    bookings.map((booking) => booking.id),
    supabase,
  );
  const notesByBookingId = new Map(
    notes.map((note) => [note.bookingId, note]),
  );
  const outcomesByBookingId = new Map(
    outcomes.map((outcome) => [outcome.bookingId, outcome]),
  );
  const nowTime = new Date().getTime();
  const availableFutureSlots = slots.filter(
    (slot) =>
      slot.status === "available" && new Date(slot.startsAt).getTime() > nowTime,
  );
  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed",
  );
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed",
  );
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled",
  );
  const activeAvailabilityRules = availabilityRules.filter(
    (rule) => rule.status === "active",
  );
  const activeBlockedWindows = blockedWindows.filter(
    (blockedWindow) => blockedWindow.status === "active",
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Mentorías" title="Agenda de mentorías">
        Gestiona la disponibilidad y el historial de reservas de mentoría
        individual.
      </AdminPageHeader>

      {params?.message ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm text-[var(--color-cyan)]">
          {params.message}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Horarios disponibles"
          value={availableFutureSlots.length}
        />
        <SummaryCard label="Reservas confirmadas" value={confirmedBookings.length} />
        <SummaryCard label="Completadas" value={completedBookings.length} />
        <SummaryCard label="Cancelaciones" value={cancelledBookings.length} />
        <SummaryCard
          label="Reglas activas"
          value={activeAvailabilityRules.length}
        />
        <SummaryCard
          label="Bloqueos activos"
          value={activeBlockedWindows.length}
        />
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-white">
              Disponibilidad predeterminada
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Define los días y rangos habituales en los que estarás disponible.
              Luego puedes generar horarios reales para las próximas semanas.
            </p>

            <form
              action={createAvailabilityRuleAction}
              className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              <label className="grid gap-2 text-sm font-semibold text-white">
                Día
                <select
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  name="dayOfWeek"
                  required
                >
                  {dayLabels.map((label, index) => (
                    <option className="bg-[#08111f]" key={label} value={index}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Hora inicio
                <input
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  name="startsAtTime"
                  required
                  type="time"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Hora fin
                <input
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  name="endsAtTime"
                  required
                  type="time"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Duración
                <select
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  defaultValue="60"
                  name="slotDurationMinutes"
                  required
                >
                  <option className="bg-[#08111f]" value="30">
                    30 minutos
                  </option>
                  <option className="bg-[#08111f]" value="45">
                    45 minutos
                  </option>
                  <option className="bg-[#08111f]" value="60">
                    60 minutos
                  </option>
                  <option className="bg-[#08111f]" value="90">
                    90 minutos
                  </option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Separación
                <select
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  defaultValue="0"
                  name="bufferMinutes"
                  required
                >
                  <option className="bg-[#08111f]" value="0">
                    Sin pausa
                  </option>
                  <option className="bg-[#08111f]" value="15">
                    15 minutos
                  </option>
                  <option className="bg-[#08111f]" value="30">
                    30 minutos
                  </option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Zona horaria
                <input
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  defaultValue={defaultMentorshipTimezone}
                  name="timezone"
                  required
                  type="text"
                />
              </label>
              <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-black transition hover:bg-white md:col-span-2 xl:col-span-3 xl:w-fit">
                Guardar regla
              </button>
            </form>
          </div>

          <div className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4">
            <h3 className="text-base font-semibold text-white">
              Generar calendario
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Crea horarios reservables usando las reglas activas y respetando
              los bloqueos manuales.
            </p>
            <form action={generateSlotsFromRulesAction} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-white">
                Desde
                <input
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  name="startsOn"
                  required
                  type="date"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Hasta
                <input
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  name="endsOn"
                  required
                  type="date"
                />
              </label>
              <button className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-cyan)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--color-cyan)] hover:text-black">
                Generar horarios
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {availabilityRules.map((rule) => (
            <article
              className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
              key={rule.id}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {dayLabels[rule.dayOfWeek]} ·{" "}
                      {formatRuleTime(rule.startsAtTime)} -{" "}
                      {formatRuleTime(rule.endsAtTime)}
                    </h3>
                    <AdminStatusBadge tone={getAvailabilityRuleTone(rule.status)}>
                      {rule.status === "active" ? "Activa" : "Pausada"}
                    </AdminStatusBadge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {rule.slotDurationMinutes} minutos por mentoría ·{" "}
                    {rule.bufferMinutes} minutos de separación · {rule.timezone}
                  </p>
                </div>
                <AvailabilityRuleActions rule={rule} />
              </div>
            </article>
          ))}
          {availabilityRules.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Aún no hay reglas predeterminadas.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-white">
              Bloqueos manuales
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Marca fechas u horarios que no deben estar disponibles aunque
              coincidan con tu calendario predeterminado.
            </p>
            <form
              action={createBlockedWindowAction}
              className="mt-5 grid gap-4 md:grid-cols-2"
            >
              <label className="grid gap-2 text-sm font-semibold text-white">
                Fecha
                <input
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  name="blockedDate"
                  required
                  type="date"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Zona horaria
                <input
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  defaultValue={defaultMentorshipTimezone}
                  name="blockedTimezone"
                  required
                  type="text"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Desde
                <input
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  name="blockedStartsAt"
                  required
                  type="time"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Hasta
                <input
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  name="blockedEndsAt"
                  required
                  type="time"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white md:col-span-2">
                Motivo interno
                <input
                  className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
                  name="reason"
                  placeholder="Ej. reunión, viaje, preparación interna"
                  type="text"
                />
              </label>
              <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-black transition hover:bg-white md:col-span-2 md:w-fit">
                Aplicar bloqueo
              </button>
            </form>
          </div>

          <div className="grid min-w-0 gap-3">
            {blockedWindows.map((blockedWindow) => (
              <article
                className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
                key={blockedWindow.id}
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-sm font-semibold text-white">
                        {formatDateTime(
                          blockedWindow.startsAt,
                          blockedWindow.timezone,
                        )}{" "}
                        -{" "}
                        {formatDateTime(
                          blockedWindow.endsAt,
                          blockedWindow.timezone,
                        )}
                      </h3>
                      <AdminStatusBadge
                        tone={getBlockedWindowTone(blockedWindow.status)}
                      >
                        {blockedWindow.status === "active"
                          ? "Activo"
                          : "Cancelado"}
                      </AdminStatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      {blockedWindow.reason ?? "Sin motivo interno."}
                    </p>
                  </div>
                  <BlockedWindowActions blockedWindow={blockedWindow} />
                </div>
              </article>
            ))}
            {blockedWindows.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)]">
                Aún no hay bloqueos manuales.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-white">Crear horario puntual</h2>
        <form action={createSlotAction} className="mt-5 grid gap-4 lg:grid-cols-5">
          <label className="grid gap-2 text-sm font-semibold text-white">
            Fecha
            <input
              className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
              name="date"
              required
              type="date"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-white">
            Hora inicio
            <input
              className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
              name="startsAt"
              required
              type="time"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-white">
            Hora fin
            <input
              className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
              name="endsAt"
              required
              type="time"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-white lg:col-span-2">
            Zona horaria IANA
            <input
              className="min-h-11 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white"
              name="timezone"
              placeholder="America/Chicago"
              required
              type="text"
            />
          </label>
          <button className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-black transition hover:bg-white lg:col-span-5 lg:w-fit">
            Publicar horario
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-white">Horarios</h2>
        <div className="mt-5 grid gap-3">
          {slots.map((slot) => {
            const booking = findBookingForSlot(slot, bookings);

            return (
              <article
                className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
                key={slot.id}
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-sm font-semibold text-white">
                        {formatDateTime(slot.startsAt, slot.timezone)} -{" "}
                        {formatDateTime(slot.endsAt, slot.timezone)}
                      </h3>
                      <AdminStatusBadge tone={getSlotTone(slot.status)}>
                        {slot.status}
                      </AdminStatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      Zona del mentor: {slot.timezone}
                    </p>
                    {booking ? (
                      <p className="mt-2 break-words text-sm text-[var(--color-text-secondary)]">
                        Reserva: {booking.participantName ?? "Participante"} ·{" "}
                        {booking.participantEmail ?? "Sin email"} ·{" "}
                        {booking.productTitle ?? "Programa"}
                      </p>
                    ) : null}
                  </div>
                  <SlotActions
                    isFuture={new Date(slot.startsAt).getTime() > nowTime}
                    slot={slot}
                  />
                </div>
              </article>
            );
          })}
          {slots.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Aún no hay horarios creados.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-white">Reservas</h2>
        <div className="mt-5 grid gap-3">
          {bookings.map((booking) => (
            <article
              className="min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4"
              key={booking.id}
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words text-sm font-semibold text-white">
                      {booking.participantName ?? "Participante sin nombre"}
                    </h3>
                    <AdminStatusBadge tone={getBookingTone(booking.status)}>
                      {booking.status}
                    </AdminStatusBadge>
                  </div>
                  <p className="mt-2 break-all text-sm text-[var(--color-text-secondary)]">
                    {booking.participantEmail ?? "Sin email"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {booking.slotStartsAt && booking.slotEndsAt
                      ? `${formatDateTime(
                          booking.slotStartsAt,
                          booking.participantTimezone,
                        )} - ${formatDateTime(
                          booking.slotEndsAt,
                          booking.participantTimezone,
                        )}`
                      : "Horario no disponible"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Zona participante: {booking.participantTimezone}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Programa: {booking.productTitle ?? "Programa"}
                  </p>
                  {booking.participantNote ? (
                    <p className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-[var(--color-border)] p-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {booking.participantNote}
                    </p>
                  ) : null}
                  <Link
                    className="mt-3 inline-flex text-sm font-semibold text-[var(--color-cyan)] hover:text-white"
                    href={`/admin/students/${booking.profileId}`}
                  >
                    Ver participante
                  </Link>
                </div>
                <BookingActions booking={booking} />
              </div>
              <PrivateNotesForm
                booking={booking}
                note={notesByBookingId.get(booking.id) ?? null}
              />
              <ParticipantOutcomeForm
                booking={booking}
                outcome={outcomesByBookingId.get(booking.id) ?? null}
              />
            </article>
          ))}
          {bookings.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">
              Aún no hay reservas registradas.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
