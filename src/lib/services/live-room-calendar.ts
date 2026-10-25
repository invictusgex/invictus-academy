function escapeCalendar(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export function buildLiveRoomCalendar(profileId: string, name: string, end: string, cancelAtEnd: boolean, now = new Date()) {
  const date = (value: Date) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const periodEnd = new Date(end);
  if (!Number.isFinite(periodEnd.getTime())) throw new Error("INVALID_DATE");
  const events = [
    { at: periodEnd, title: `${cancelAtEnd ? "Fin de acceso" : "Renovacion"}: ${name}`, detail: "Comprobar pago y rol en el panel de Sala en vivo. Este recordatorio no confirma el pago ni cambia el acceso." },
    { at: new Date(periodEnd.getTime() + 86400000), title: `Revisar pago y Discord: ${name}`, detail: "Consultar Stripe y Discord en el panel. Si no hay derecho vigente, el rol debe estar retirado. No retirar acceso basandose solo en este calendario." },
  ];
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Invictus GEX//Sala en vivo//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const [index, event] of events.entries()) {
    lines.push("BEGIN:VEVENT", `UID:live-room-${profileId}-${date(periodEnd)}-${index}@invictusgex.com`, `DTSTAMP:${date(now)}`, `DTSTART:${date(event.at)}`, `DTEND:${date(new Date(event.at.getTime() + 900000))}`, `SUMMARY:${escapeCalendar(event.title)}`, `DESCRIPTION:${escapeCalendar(event.detail)}`, "URL:https://invictusgex.com/admin/live-room", "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:PT0S", "DESCRIPTION:Revisar membresia de sala", "END:VALARM", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  // RFC 5545 folds content lines at 75 octets, without splitting UTF-8 characters.
  return lines.map((line) => {
    let result = ""; let width = 0;
    for (const char of line) {
      const bytes = Buffer.byteLength(char);
      if (width + bytes > 75) { result += "\r\n "; width = 1; }
      result += char; width += bytes;
    }
    return result;
  }).join("\r\n") + "\r\n";
}
