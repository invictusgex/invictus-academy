import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireAdminServerContext } from "@/app/admin/admin-auth";
import { LiveRoomRepository } from "@/lib/repositories/live-room.repository";
import { liveRoomIsLive } from "@/lib/services/live-room-config";
import { LiveRoomService } from "@/lib/services/live-room.service";
import { getLiveRoomAudit } from "@/lib/services/live-room-audit.service";
import { LiveRoomAccessAudit } from "@/components/admin/live-room/LiveRoomAccessAudit";
import { getLiveRoomAlertConfig, liveRoomAlertLabels, LiveRoomAlertsService } from "@/lib/services/live-room-alerts.service";
import { LiveRoomAlertRepository } from "@/lib/repositories/live-room-alert.repository";
import { testLiveRoomEmail, retryLiveRoomEmails } from "@/app/admin/live-room/email-actions";
import { LiveRoomEmailControls } from "@/components/admin/live-room/LiveRoomEmailControls";

async function refreshAudit(form: FormData) {
  "use server";
  await requireAdminServerContext();
  const page = Math.max(1, Math.min(100000, Math.floor(Number(form.get("page")) || 1)));
  const view = ["issues", "renewals"].includes(String(form.get("view"))) ? String(form.get("view")) : "all";
  after(async () => {
    try {
      const audit = await getLiveRoomAudit(page);
      await LiveRoomAlertsService.captureAudit(audit.accounts.some((item) => ["missing_role", "unexpected_role"].includes(item.result)), audit.accounts.some((item) => item.result === "unknown"));
      await LiveRoomAlertsService.deliverPending();
    } catch { console.error("[live-room:alerts] manual_review_notice_unavailable"); }
  });
  revalidatePath("/admin/live-room");
  redirect(`/admin/live-room?page=${page}&view=${view}`);
}

async function syncAccount(form: FormData) {
  "use server";
  await requireAdminServerContext();
  const profileId = String(form.get("profileId") ?? "");
  const page = Math.max(1, Math.min(100000, Number(form.get("page")) || 1));
  if (!/^[0-9a-f-]{36}$/i.test(profileId)) redirect("/admin/live-room?status=invalid");
  let failed = false;
  try {
    if (!await LiveRoomService.getAccount(profileId)) throw new Error("NOT_FOUND");
    await LiveRoomService.sync(profileId);
  } catch { failed = true; }
  revalidatePath("/admin/live-room");
  redirect(`/admin/live-room?page=${Math.floor(page)}&status=${failed ? "retry" : "synced"}`);
}

async function saveDescription(form: FormData) {
  "use server";
  await requireAdminServerContext();
  const description = String(form.get("description") ?? "").trim();
  if (!description || description.length > 2000) redirect("/admin/live-room?status=invalid");
  await LiveRoomRepository.saveDescription(description);
  revalidateTag("live-room-offer", { expire: 0 });
  revalidatePath("/sala-en-vivo");
  redirect("/admin/live-room?status=saved");
}

async function reconcile() {
  "use server";
  await requireAdminServerContext();
  const rows = await LiveRoomRepository.listNeedsSync(liveRoomIsLive());
  let failed = false;
  for (const row of rows) {
    try { await LiveRoomService.sync(row.profile_id); } catch { failed = true; }
  }
  revalidatePath("/admin/live-room");
  redirect(`/admin/live-room?status=${failed ? "retry" : "synced"}`);
}

export default async function AdminLiveRoomPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string; view?: string }> }) {
  await requireAdminServerContext();
  const params = await searchParams;
  const alertConfig = getLiveRoomAlertConfig();
  let notices: Awaited<ReturnType<typeof LiveRoomAlertRepository.recent>> | null = null;
  try { notices = await LiveRoomAlertRepository.recent(liveRoomIsLive()); } catch { /* The queue has its own readiness state. */ }
  const page = Math.max(1, Math.min(100000, Math.floor(Number(params.page) || 1)));
  const filter = ["issues", "renewals"].includes(params.view ?? "") ? params.view! : "all";
  const offer = await LiveRoomService.getOffer();
  let description: string | null = null;
  let schemaPending = false;
  try { description = await LiveRoomRepository.getDescription(); }
  catch (error) {
    if (error instanceof Error && error.message === "LIVE_ROOM_SCHEMA_PENDING") schemaPending = true;
    else throw error;
  }
  let audit: Awaited<ReturnType<typeof getLiveRoomAudit>> | null = null;
  if (!schemaPending) {
    try { audit = await getLiveRoomAudit(page); } catch { /* The panel reports unavailable verification without inventing results. */ }
  }
  const statuses: Record<string, string> = { saved: "Descripción actualizada.", synced: "Accesos comprobados.", retry: "Algunos accesos siguen pendientes. Vuelve a comprobarlos.", invalid: "Introduce una descripción de entre 1 y 2000 caracteres.", email_sent: "El proveedor aceptó el correo de prueba. Comprueba tu bandeja y spam.", email_failed: "No se pudo enviar el aviso. Revisa la configuración del correo y los pendientes.", email_retried: "Reintento completado. Revisa el estado de cada aviso en el historial." };
  return (
    <div className="min-w-0 space-y-8">
      <header><h1 className="text-3xl font-semibold text-white">Sala privada en vivo</h1><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">Descripción pública y sincronización de accesos a Discord.</p></header>
      {params.status && statuses[params.status] ? <p role="status" className="text-sm text-[var(--color-cyan)]">{statuses[params.status]}</p> : null}
      {schemaPending ? <p role="status" className="text-sm leading-7 text-[var(--color-text-secondary)]">Falta aplicar la migración de membresías para habilitar la gestión.</p> : (
        <>
          <form action={saveDescription} className="space-y-5">
            <label className="block text-sm font-semibold text-white" htmlFor="live-room-description">Descripción de la sala</label>
            <textarea id="live-room-description" name="description" required maxLength={2000} rows={7} defaultValue={description ?? offer.description} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 text-sm leading-7 text-white focus:border-[var(--color-cyan)] focus:outline-none" />
            <button type="submit" className="rounded-full bg-[var(--color-cyan)] px-6 py-3 text-sm font-semibold text-[var(--color-page-bg)]">Guardar descripción</button>
          </form>
          <section className="border-t border-[var(--color-border)] pt-6"><h2 className="text-xl font-semibold text-white">Accesos de la sala</h2><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">Comprueba hasta 25 membresías por ejecución. Los errores se conservan como pendientes para volver a intentarlo.</p><form action={reconcile} className="mt-5"><button type="submit" className="rounded-full border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-white">Comprobar accesos</button></form></section>
        </>
      )}
      <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{offer.configured ? `Tarifa vigente en Stripe: ${offer.amountUsd} USD / mes.` : "Precio de Stripe pendiente de verificar."} Para cambiarla, crea un precio mensual y establécelo como predeterminado del producto. Las suscripciones existentes conservan su tarifa.</p>
      {!schemaPending && (audit ? <LiveRoomAccessAudit audit={audit} page={page} filter={filter} syncAccount={syncAccount} refreshAudit={refreshAudit} /> : <p role="alert" className="text-sm text-amber-300">No se pudo cargar la auditoría de membresías. Vuelve a actualizar; no se ha confirmado ningún acceso.</p>)}
      <section className="space-y-4 border-t border-[var(--color-border)] pt-6" aria-labelledby="email-alert-heading">
        <h2 id="email-alert-heading" className="text-xl font-semibold text-white">Avisos por correo</h2>
        <p className="break-words text-sm text-[var(--color-text-secondary)]">Destino: {alertConfig.to ?? "Falta LIVE_ROOM_ALERT_EMAIL"} · Proveedor: {alertConfig.providerReady ? "Configurado" : "Pendiente"}</p>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">Avisos de facturación recibidos de Stripe y de incidencias detectadas al actualizar la revisión. Sin nombres, identificadores de clientes ni datos bancarios. No hay una alarma automática a las 24 horas: esa revisión sigue en el calendario.</p>
        <LiveRoomEmailControls ready={Boolean(alertConfig.to && alertConfig.providerReady)} queueReady={Boolean(notices)} testAction={testLiveRoomEmail} retryAction={retryLiveRoomEmails} />
        {!notices ? <p className="text-sm text-amber-300">No se pudo consultar la cola de avisos. Falta configurar o verificar su migración.</p> : notices.length ? <ul className="divide-y divide-[var(--color-border)] text-sm">{notices.map((notice, index) => <li key={index} className="flex flex-wrap justify-between gap-2 py-3"><span>{liveRoomAlertLabels[notice.kind] ?? "Aviso de sala"} · {new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" }).format(new Date(notice.occurred_at))}</span><span className={notice.sent_at ? "text-emerald-300" : "text-amber-300"}>{notice.sent_at ? "Aceptado por el proveedor" : notice.last_failed ? "Envío fallido, pendiente" : "Pendiente"} · Intentos: {notice.attempts}</span></li>)}</ul> : <p className="text-sm text-[var(--color-text-secondary)]">Todavía no hay avisos registrados.</p>}
      </section>
    </div>
  );
}
