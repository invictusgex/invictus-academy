export const mentorshipBookingTimezone = "America/Chicago";

function localDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: mentorshipBookingTimezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const get = (key: string) => parts.find(part => part.type === key)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function isMentorshipBookingDateAllowed(startsAt: string, now = new Date()) {
  const starts = new Date(startsAt);
  return Number.isFinite(starts.getTime()) && Number.isFinite(now.getTime()) && localDate(starts) > localDate(now);
}
