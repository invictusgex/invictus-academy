"use client";

import { useMemo, useState, useTransition } from "react";

import {
  StudentCard,
  StudentSection,
  StudentStatusBadge,
} from "@/components/student";
import type {
  MentorshipBooking,
  MentorshipSlot,
} from "@/lib/types/mentorship-scheduling.types";

type MentorshipSchedulingPanelProps = {
  bookings: MentorshipBooking[];
  requirementsSatisfied: boolean;
  slots: MentorshipSlot[];
};

type SchedulingPayload =
  | {
      booking: MentorshipBooking;
      bookings?: MentorshipBooking[];
      slots?: MentorshipSlot[];
    }
  | {
      bookings: MentorshipBooking[];
      slots: MentorshipSlot[];
    }
  | {
      error: {
        code: string;
        message: string;
      };
    };

function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
}

function formatSlotDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "full",
    timeZone: timezone,
  }).format(new Date(value));
}

function formatSlotTimeRange(
  startsAt: string,
  endsAt: string,
  timezone: string,
) {
  const formatter = new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });

  return `${formatter.format(new Date(startsAt))} - ${formatter.format(
    new Date(endsAt),
  )}`;
}

function getConfirmedBooking(bookings: MentorshipBooking[]) {
  return (
    bookings.find((booking) => booking.status === "confirmed") ?? null
  );
}

function getLastCancelledBooking(bookings: MentorshipBooking[]) {
  return (
    bookings.find((booking) => booking.status === "cancelled") ?? null
  );
}

export function MentorshipSchedulingPanel({
  bookings: initialBookings,
  requirementsSatisfied,
  slots: initialSlots,
}: MentorshipSchedulingPanelProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [slots, setSlots] = useState(initialSlots);
  const [selectedSlotId, setSelectedSlotId] = useState(
    initialSlots[0]?.id ?? "",
  );
  const [participantNote, setParticipantNote] = useState("");
  const [participantTimezone, setParticipantTimezone] =
    useState(getBrowserTimezone);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const confirmedBooking = useMemo(() => getConfirmedBooking(bookings), [
    bookings,
  ]);
  const cancelledBooking = useMemo(() => getLastCancelledBooking(bookings), [
    bookings,
  ]);
  const effectiveSelectedSlotId = selectedSlotId || slots[0]?.id || "";

  async function refreshScheduling() {
    const response = await fetch("/api/academy/mentorship-scheduling", {
      cache: "no-store",
    });
    const payload = (await response.json()) as SchedulingPayload;

    if ("error" in payload) {
      throw new Error(payload.error.message);
    }

    if (!("slots" in payload) || !payload.slots || !payload.bookings) {
      throw new Error("No pudimos actualizar la agenda de mentoría.");
    }

    setSlots(payload.slots);
    setBookings(payload.bookings);
  }

  function applyPayload(payload: SchedulingPayload) {
    if ("error" in payload) {
      throw new Error(payload.error.message);
    }

    if (payload.slots) {
      setSlots(payload.slots);
    }

    if (payload.bookings) {
      setBookings(payload.bookings);
    }
  }

  function bookSlot() {
    setError(null);
    setMessage(null);

    if (!participantTimezone.trim()) {
      setError("Selecciona una zona horaria valida antes de reservar.");
      return;
    }

    if (!effectiveSelectedSlotId) {
      setError("Selecciona un horario disponible.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/academy/mentorship-scheduling", {
        body: JSON.stringify({
          participantNote,
          participantTimezone,
          slotId: effectiveSelectedSlotId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as SchedulingPayload;

      try {
        if (!response.ok) {
          if ("error" in payload) {
            setError(payload.error.message);
          }
          await refreshScheduling();
          return;
        }
        applyPayload(payload);
        setMessage("Tu mentoría quedó reservada correctamente.");
        setParticipantNote("");
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No pudimos reservar la mentoría.",
        );
      }
    });
  }

  function cancelBooking() {
    if (!confirmedBooking) {
      return;
    }

    const shouldCancel = window.confirm(
      "¿Quieres cancelar esta reserva de mentoría?",
    );

    if (!shouldCancel) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/academy/mentorship-scheduling", {
        body: JSON.stringify({
          bookingId: confirmedBooking.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });
      const payload = (await response.json()) as SchedulingPayload;

      try {
        applyPayload(payload);
        if (!response.ok) {
          return;
        }
        setMessage("Tu reserva fue cancelada correctamente.");
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "No pudimos cancelar la reserva.",
        );
      }
    });
  }

  if (!requirementsSatisfied) {
    return (
      <StudentSection title="Agenda de mentoría">
        <StudentCard>
          <h2 className="text-2xl font-semibold text-white">
            La agenda se habilitará al completar tu preparación.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Cuando completes los requisitos pendientes, podrás elegir un horario
            disponible para tu mentoría individual desde esta misma sección.
          </p>
        </StudentCard>
      </StudentSection>
    );
  }

  if (confirmedBooking) {
    return (
      <StudentSection title="Mentoría reservada">
        <StudentCard elevated>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-white">
                  Tu mentoría está confirmada.
                </h2>
                <StudentStatusBadge tone="complete">
                  Confirmada
                </StudentStatusBadge>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                Fecha:{" "}
                {confirmedBooking.slotStartsAt
                  ? formatSlotDate(
                      confirmedBooking.slotStartsAt,
                      confirmedBooking.participantTimezone,
                    )
                  : "Fecha por confirmar"}
              </p>
              {confirmedBooking.slotStartsAt && confirmedBooking.slotEndsAt ? (
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Hora:{" "}
                  {formatSlotTimeRange(
                    confirmedBooking.slotStartsAt,
                    confirmedBooking.slotEndsAt,
                    confirmedBooking.participantTimezone,
                  )}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Zona horaria: {confirmedBooking.participantTimezone}
              </p>
              {confirmedBooking.participantNote ? (
                <p className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-[var(--color-border)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {confirmedBooking.participantNote}
                </p>
              ) : null}
            </div>
            <button
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:text-[var(--color-text-muted)] sm:w-auto"
              disabled={isPending}
              onClick={cancelBooking}
              type="button"
            >
              Cancelar reserva
            </button>
          </div>
          {message ? (
            <p className="mt-4 text-sm text-[var(--color-cyan)]">{message}</p>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm text-red-300">{error}</p>
          ) : null}
        </StudentCard>
      </StudentSection>
    );
  }

  return (
    <StudentSection
      description="Selecciona un horario futuro disponible. La reserva se confirma con tu zona horaria real."
      title="Agenda de mentoría"
    >
      <StudentCard elevated>
        {cancelledBooking ? (
          <p className="mb-5 rounded-xl border border-[var(--color-border)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            Tu reserva anterior fue cancelada. Puedes seleccionar un nuevo
            horario mientras mantengas los requisitos completos.
          </p>
        ) : null}

        {slots.length === 0 ? (
          <div>
            <h2 className="text-2xl font-semibold text-white">
              No hay horarios disponibles en este momento.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Publicaremos nuevas fechas próximamente.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="grid gap-3">
              {slots.map((slot) => (
                <label
                  className="flex min-w-0 cursor-pointer flex-col gap-3 rounded-xl border border-[var(--color-border)] p-4 transition hover:border-[var(--color-cyan)] sm:flex-row sm:items-center sm:justify-between"
                  key={slot.id}
                >
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-semibold text-white">
                      {participantTimezone
                        ? formatSlotDate(slot.startsAt, participantTimezone)
                        : "Horario disponible"}
                    </span>
                    <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">
                      {participantTimezone
                        ? formatSlotTimeRange(
                            slot.startsAt,
                            slot.endsAt,
                            participantTimezone,
                          )
                        : "Detectando zona horaria"}
                    </span>
                  </span>
                  <input
                    checked={effectiveSelectedSlotId === slot.id}
                    className="h-5 w-5 accent-[var(--color-cyan)]"
                    name="mentorship-slot"
                    onChange={() => setSelectedSlotId(slot.id)}
                    type="radio"
                  />
                </label>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
              <label className="grid gap-2 text-sm font-semibold text-white">
                Zona horaria
                <input
                  className="min-h-11 min-w-0 rounded-xl border border-[var(--color-border)] bg-black/20 px-4 text-sm text-white outline-none transition focus:border-[var(--color-cyan)]"
                  onChange={(event) => setParticipantTimezone(event.target.value)}
                  placeholder="America/Chicago"
                  type="text"
                  value={participantTimezone}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white">
                Nota opcional
                <textarea
                  className="min-h-28 min-w-0 resize-y rounded-xl border border-[var(--color-border)] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-[var(--color-cyan)]"
                  onChange={(event) => setParticipantNote(event.target.value)}
                  placeholder="Puedes añadir contexto breve para tu mentoría."
                  value={participantNote}
                />
              </label>
            </div>

            <button
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-[var(--color-text-muted)] sm:w-auto"
              disabled={isPending}
              onClick={bookSlot}
              type="button"
            >
              Reservar mentoría
            </button>
          </div>
        )}

        {message ? (
          <p className="mt-4 text-sm text-[var(--color-cyan)]">{message}</p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </StudentCard>
    </StudentSection>
  );
}
