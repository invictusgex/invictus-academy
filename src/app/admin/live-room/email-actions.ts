"use server";

import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { emailFailureCode, emailFailureMessages } from "@/lib/email/email-errors";
import { LiveRoomAlertsService } from "@/lib/services/live-room-alerts.service";
import type { LiveRoomEmailActionState } from "@/lib/types/live-room-alert.types";

export async function testLiveRoomEmail(): Promise<LiveRoomEmailActionState> {
  await requireAdminServerContext();
  try {
    const sent = await LiveRoomAlertsService.sendTest();
    return sent ? { status: "success", message: "Resend aceptó el correo de prueba. Comprueba tu bandeja de entrada y spam." }
      : { status: "error", message: emailFailureMessages.configuration };
  } catch (error) {
    const code = emailFailureCode(error);
    console.error("[live-room:email-test]", JSON.stringify({ code }));
    return { status: "error", message: emailFailureMessages[code] };
  }
}

export async function retryLiveRoomEmails(): Promise<LiveRoomEmailActionState> {
  await requireAdminServerContext();
  try {
    const report = await LiveRoomAlertsService.deliverPending();
    if (report.error) return { status: "error", message: `${emailFailureMessages[report.error]} Aceptados: ${report.sent}. Pendientes tras fallo: ${report.failed}.` };
    return { status: "success", message: report.sent ? `Resend aceptó ${report.sent} avisos. Actualiza la revisión para ver el historial.` : report.busy ? "Los avisos están siendo procesados por otra ejecución." : "No hay avisos pendientes en este lote." };
  } catch {
    return { status: "error", message: "No se pudo consultar o actualizar la cola de avisos. Revisa los registros del servidor." };
  }
}
