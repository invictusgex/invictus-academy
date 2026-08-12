import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { MentorshipSchedulingRepository } from "@/lib/repositories/mentorship-scheduling.repository";
import type { Database } from "@/lib/supabase/database.types";
import type {
  AdminMentorshipBooking,
  MentorshipAvailabilityRule,
  MentorshipAvailabilityRuleCreateInput,
  MentorshipAvailabilityRuleStatusUpdateInput,
  MentorshipBlockedWindow,
  MentorshipBlockedWindowCreateInput,
  MentorshipBlockedWindowStatusUpdateInput,
  MentorshipBooking,
  MentorshipBookingAdminStatusUpdateInput,
  MentorshipBookingRequest,
  MentorshipSlot,
  MentorshipSlotCreateInput,
  MentorshipSlotGenerationInput,
  MentorshipSlotGenerationResult,
  MentorshipSlotUpdateInput,
} from "@/lib/types/mentorship-scheduling.types";

function assertNonEmpty(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

function assertFutureRange(startsAt: string, endsAt: string) {
  const startsAtTime = new Date(startsAt).getTime();
  const endsAtTime = new Date(endsAt).getTime();

  if (!Number.isFinite(startsAtTime) || !Number.isFinite(endsAtTime)) {
    throw new Error("MENTORSHIP_SLOT_INVALID_DATE");
  }

  if (startsAtTime <= Date.now()) {
    throw new Error("MENTORSHIP_SLOT_STARTS_IN_PAST");
  }

  if (endsAtTime <= startsAtTime) {
    throw new Error("MENTORSHIP_SLOT_INVALID_RANGE");
  }
}

function assertTimeValue(value: string, message: string) {
  if (!/^\d{2}:\d{2}(?::\d{2})?$/.test(value.trim())) {
    throw new Error(message);
  }
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
    throw new Error("MENTORSHIP_INVALID_LOCAL_DATETIME");
  }

  const approximateUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offsetMinutes = getOffsetMinutes(timezone, approximateUtc);

  return new Date(
    Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000,
  ).toISOString();
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);

  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return nextDate;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(startsOn: string, endsOn: string) {
  const start = new Date(`${startsOn}T00:00:00.000Z`);
  const end = new Date(`${endsOn}T00:00:00.000Z`);

  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
    throw new Error("MENTORSHIP_GENERATION_INVALID_RANGE");
  }

  if (end.getTime() < start.getTime()) {
    throw new Error("MENTORSHIP_GENERATION_INVALID_RANGE");
  }

  const dates: string[] = [];

  for (let current = start; current <= end; current = addDays(current, 1)) {
    dates.push(formatDateInput(current));
  }

  return dates;
}

function getUtcDayOfWeek(date: string) {
  return new Date(`${date}T12:00:00.000Z`).getUTCDay();
}

function timeToMinutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);

  return hour * 60 + minute;
}

function minutesToTime(value: number) {
  const hour = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minute = (value % 60).toString().padStart(2, "0");

  return `${hour}:${minute}`;
}

function rangesOverlap(
  startsAt: string,
  endsAt: string,
  existingStartsAt: string,
  existingEndsAt: string,
) {
  return (
    new Date(startsAt).getTime() < new Date(existingEndsAt).getTime() &&
    new Date(endsAt).getTime() > new Date(existingStartsAt).getTime()
  );
}

function isBlockedSlot(
  startsAt: string,
  endsAt: string,
  blockedWindows: MentorshipBlockedWindow[],
) {
  return blockedWindows.some((blockedWindow) =>
    rangesOverlap(startsAt, endsAt, blockedWindow.startsAt, blockedWindow.endsAt),
  );
}

function hasExistingSlotOverlap(
  startsAt: string,
  endsAt: string,
  existingSlots: MentorshipSlot[],
) {
  return existingSlots.some((slot) =>
    rangesOverlap(startsAt, endsAt, slot.startsAt, slot.endsAt),
  );
}

function buildSlotsFromRule(
  date: string,
  rule: MentorshipAvailabilityRule,
  createdBy: string,
) {
  const slots: Array<MentorshipSlotCreateInput & { createdBy: string }> = [];
  const startMinutes = timeToMinutes(rule.startsAtTime);
  const endMinutes = timeToMinutes(rule.endsAtTime);
  const stepMinutes = rule.slotDurationMinutes + rule.bufferMinutes;

  for (
    let current = startMinutes;
    current + rule.slotDurationMinutes <= endMinutes;
    current += stepMinutes
  ) {
    const startsAt = zonedDateTimeToUtcIso(
      date,
      minutesToTime(current),
      rule.timezone,
    );
    const endsAt = zonedDateTimeToUtcIso(
      date,
      minutesToTime(current + rule.slotDurationMinutes),
      rule.timezone,
    );

    slots.push({
      createdBy,
      endsAt,
      startsAt,
      timezone: rule.timezone,
    });
  }

  return slots;
}

export const MentorshipSchedulingService = {
  async listAvailableSlots(
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlot[]> {
    const slots =
      await MentorshipSchedulingRepository.listAvailableFutureSlots(supabase);

    if (slots.length === 0) {
      return slots;
    }

    const rangeStartsAt = new Date().toISOString();
    const rangeEndsAt = slots.reduce((latestEndsAt, slot) =>
      new Date(slot.endsAt).getTime() > new Date(latestEndsAt).getTime()
        ? slot.endsAt
        : latestEndsAt,
    slots[0]?.endsAt ?? rangeStartsAt);
    const blockedWindows =
      await MentorshipSchedulingRepository.listActiveBlockedWindowsBetween(
        rangeStartsAt,
        rangeEndsAt,
        supabase,
      );

    return slots.filter(
      (slot) => !isBlockedSlot(slot.startsAt, slot.endsAt, blockedWindows),
    );
  },

  async listAdminSlots(
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlot[]> {
    return MentorshipSchedulingRepository.listAdminSlots(supabase);
  },

  async createAdminSlot(
    input: MentorshipSlotCreateInput & {
      createdBy: string;
    },
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlot> {
    assertNonEmpty(input.createdBy, "MENTORSHIP_SLOT_CREATED_BY_REQUIRED");
    assertNonEmpty(input.timezone, "MENTORSHIP_SLOT_TIMEZONE_REQUIRED");
    assertFutureRange(input.startsAt, input.endsAt);

    return MentorshipSchedulingRepository.createAdminSlot(input, supabase);
  },

  async listAvailabilityRules(
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipAvailabilityRule[]> {
    return MentorshipSchedulingRepository.listAvailabilityRules(supabase);
  },

  async createAvailabilityRule(
    input: MentorshipAvailabilityRuleCreateInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipAvailabilityRule> {
    assertNonEmpty(input.createdBy, "MENTORSHIP_RULE_CREATED_BY_REQUIRED");
    assertNonEmpty(input.timezone, "MENTORSHIP_RULE_TIMEZONE_REQUIRED");
    assertTimeValue(input.startsAtTime, "MENTORSHIP_RULE_START_TIME_INVALID");
    assertTimeValue(input.endsAtTime, "MENTORSHIP_RULE_END_TIME_INVALID");

    if (input.dayOfWeek < 0 || input.dayOfWeek > 6) {
      throw new Error("MENTORSHIP_RULE_DAY_INVALID");
    }

    if (input.slotDurationMinutes < 15 || input.slotDurationMinutes > 240) {
      throw new Error("MENTORSHIP_RULE_DURATION_INVALID");
    }

    if (input.bufferMinutes < 0 || input.bufferMinutes > 120) {
      throw new Error("MENTORSHIP_RULE_BUFFER_INVALID");
    }

    if (timeToMinutes(input.endsAtTime) <= timeToMinutes(input.startsAtTime)) {
      throw new Error("MENTORSHIP_RULE_TIME_RANGE_INVALID");
    }

    return MentorshipSchedulingRepository.createAvailabilityRule(input, supabase);
  },

  async setAvailabilityRuleStatus(
    input: MentorshipAvailabilityRuleStatusUpdateInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipAvailabilityRule> {
    assertNonEmpty(input.id, "MENTORSHIP_RULE_ID_REQUIRED");

    return MentorshipSchedulingRepository.updateAvailabilityRuleStatus(
      input,
      supabase,
    );
  },

  async listBlockedWindows(
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBlockedWindow[]> {
    return MentorshipSchedulingRepository.listBlockedWindows(supabase);
  },

  async createBlockedWindow(
    input: MentorshipBlockedWindowCreateInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBlockedWindow> {
    assertNonEmpty(input.createdBy, "MENTORSHIP_BLOCK_CREATED_BY_REQUIRED");
    assertNonEmpty(input.timezone, "MENTORSHIP_BLOCK_TIMEZONE_REQUIRED");
    assertFutureRange(input.startsAt, input.endsAt);

    const blockedWindow = await MentorshipSchedulingRepository.createBlockedWindow(
      input,
      supabase,
    );

    await MentorshipSchedulingRepository.blockAvailableSlotsBetween(
      input.startsAt,
      input.endsAt,
      supabase,
    );

    return blockedWindow;
  },

  async setBlockedWindowStatus(
    input: MentorshipBlockedWindowStatusUpdateInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBlockedWindow> {
    assertNonEmpty(input.id, "MENTORSHIP_BLOCK_ID_REQUIRED");

    return MentorshipSchedulingRepository.updateBlockedWindowStatus(
      input,
      supabase,
    );
  },

  async generateAvailabilitySlots(
    input: MentorshipSlotGenerationInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlotGenerationResult> {
    assertNonEmpty(input.createdBy, "MENTORSHIP_GENERATION_CREATED_BY_REQUIRED");

    const dates = getDateRange(input.startsOn, input.endsOn);
    const rangeStartsAt = `${input.startsOn}T00:00:00.000Z`;
    const rangeEndsAt = `${input.endsOn}T23:59:59.999Z`;
    const [rules, blockedWindows, existingSlots] = await Promise.all([
      MentorshipSchedulingRepository.listAvailabilityRules(supabase),
      MentorshipSchedulingRepository.listActiveBlockedWindowsBetween(
        rangeStartsAt,
        rangeEndsAt,
        supabase,
      ),
      MentorshipSchedulingRepository.listAdminSlotsBetween(
        rangeStartsAt,
        rangeEndsAt,
        supabase,
      ),
    ]);
    const activeRules = rules.filter((rule) => rule.status === "active");
    const nowTime = Date.now();
    const candidates = dates.flatMap((date) =>
      activeRules
        .filter((rule) => rule.dayOfWeek === getUtcDayOfWeek(date))
        .flatMap((rule) => buildSlotsFromRule(date, rule, input.createdBy)),
    );
    const acceptedSlots: Array<MentorshipSlotCreateInput & { createdBy: string }> =
      [];
    let skippedCount = 0;

    candidates.forEach((candidate) => {
      const startsAtTime = new Date(candidate.startsAt).getTime();

      if (
        startsAtTime <= nowTime ||
        isBlockedSlot(candidate.startsAt, candidate.endsAt, blockedWindows) ||
        hasExistingSlotOverlap(candidate.startsAt, candidate.endsAt, [
          ...existingSlots,
          ...acceptedSlots.map((slot) => ({
            createdAt: "",
            createdBy: slot.createdBy,
            endsAt: slot.endsAt,
            id: "",
            startsAt: slot.startsAt,
            status: "available" as const,
            timezone: slot.timezone,
            updatedAt: "",
          })),
        ])
      ) {
        skippedCount += 1;
        return;
      }

      acceptedSlots.push(candidate);
    });
    const createdSlots = await MentorshipSchedulingRepository.createAdminSlots(
      acceptedSlots,
      supabase,
    );

    return {
      createdSlots,
      skippedCount,
    };
  },

  async updateAdminSlot(
    input: MentorshipSlotUpdateInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlot> {
    assertNonEmpty(input.id, "MENTORSHIP_SLOT_ID_REQUIRED");

    if (input.timezone !== undefined) {
      assertNonEmpty(input.timezone, "MENTORSHIP_SLOT_TIMEZONE_REQUIRED");
    }

    if (input.startsAt && input.endsAt) {
      assertFutureRange(input.startsAt, input.endsAt);
    }

    return MentorshipSchedulingRepository.updateAdminSlot(input, supabase);
  },

  async setAdminSlotStatus(
    input: Pick<MentorshipSlotUpdateInput, "id" | "status">,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipSlot> {
    assertNonEmpty(input.id, "MENTORSHIP_SLOT_ID_REQUIRED");

    if (!input.status) {
      throw new Error("MENTORSHIP_SLOT_STATUS_REQUIRED");
    }

    const slot = await MentorshipSchedulingRepository.getSlotById(
      input.id,
      supabase,
    );

    if (!slot) {
      throw new Error("MENTORSHIP_SLOT_NOT_FOUND");
    }

    if (slot.status === "booked") {
      throw new Error("MENTORSHIP_SLOT_BOOKED_STATUS_LOCKED");
    }

    if (
      input.status === "available" &&
      new Date(slot.startsAt).getTime() <= Date.now()
    ) {
      throw new Error("MENTORSHIP_SLOT_PAST_CANNOT_ENABLE");
    }

    if (input.status === "booked") {
      throw new Error("MENTORSHIP_SLOT_STATUS_BOOKED_RESERVED");
    }

    return MentorshipSchedulingRepository.updateAdminSlot(input, supabase);
  },

  async listStudentBookings(
    profileId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBooking[]> {
    assertNonEmpty(profileId, "MENTORSHIP_PROFILE_REQUIRED");

    return MentorshipSchedulingRepository.listBookingsByProfile(
      profileId,
      supabase,
    );
  },

  async listAdminBookings(
    supabase?: SupabaseClient<Database>,
  ): Promise<AdminMentorshipBooking[]> {
    return MentorshipSchedulingRepository.listAdminBookings(supabase);
  },

  async updateAdminBookingStatus(
    input: MentorshipBookingAdminStatusUpdateInput,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBooking> {
    assertNonEmpty(input.bookingId, "MENTORSHIP_BOOKING_ID_REQUIRED");

    return MentorshipSchedulingRepository.updateAdminBookingStatus(
      input,
      supabase,
    );
  },

  async bookSlot(
    input: MentorshipBookingRequest,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBooking> {
    assertNonEmpty(input.slotId, "MENTORSHIP_SLOT_ID_REQUIRED");
    assertNonEmpty(
      input.participantTimezone,
      "MENTORSHIP_PARTICIPANT_TIMEZONE_REQUIRED",
    );

    return MentorshipSchedulingRepository.bookSlot(input, supabase);
  },

  async cancelBooking(
    bookingId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<MentorshipBooking> {
    assertNonEmpty(bookingId, "MENTORSHIP_BOOKING_ID_REQUIRED");

    return MentorshipSchedulingRepository.cancelBooking(bookingId, supabase);
  },
};
