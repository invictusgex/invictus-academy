import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { LiveRoomService } from "@/lib/services/live-room.service";
import { auditLiveRoomAccount } from "@/lib/services/live-room-audit.service";
import { buildLiveRoomCalendar } from "@/lib/services/live-room-calendar";

export async function GET(_request: Request, { params }: { params: Promise<{ profileId: string }> }) {
  await requireAdminServerContext();
  const { profileId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(profileId)) return new Response(null, { status: 400 });
  const row = await LiveRoomService.getAccount(profileId);
  if (!row) return new Response(null, { status: 404 });
  const audit = await auditLiveRoomAccount(row);
  if (audit.stripeError || !audit.periodEnd || !["active", "past_due", "trialing"].includes(audit.status)) return new Response("No hay una fecha vigente verificada en Stripe.", { status: 409 });
  return new Response(buildLiveRoomCalendar(profileId, row.discord_name ?? "Miembro de sala", audit.periodEnd, audit.cancelAtEnd), {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="recordatorios-sala.ics"', "Cache-Control": "private, no-store" },
  });
}
