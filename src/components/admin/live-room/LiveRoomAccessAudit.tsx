import Link from "next/link";
import type { getLiveRoomAudit } from "@/lib/services/live-room-audit.service";

type Audit = Awaited<ReturnType<typeof getLiveRoomAudit>>;
const date = (value: string | null) => value ? new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" }).format(new Date(value)) : "—";
const states: Record<string, string> = { active: "Activa", canceled: "Cancelada", past_due: "Pago vencido", unpaid: "Impagada", incomplete: "Incompleta", incomplete_expired: "Checkout vencido", trialing: "En prueba", paused: "Pausada", none: "Sin suscripción", unverified: "Sin verificar" };
const results = { correct: "Correcto", missing_role: "Falta asignar rol", unexpected_role: "Retirar rol", unknown: "Sin verificar" };
const yesNo = (value: boolean | null) => value === null ? "Sin verificar" : value ? "Sí" : "No";

export function LiveRoomAccessAudit({ audit, page, filter, syncAccount, refreshAudit }: { audit: Audit; page: number; filter: string; syncAccount: (form: FormData) => Promise<void>; refreshAudit: (form: FormData) => Promise<void> }) {
  const profiles = new Map(audit.profiles.map((profile) => [profile.id, profile]));
  const now = new Date(audit.checkedAt).getTime();
  const rows = audit.accounts.filter((item) => {
    if (filter === "issues") return item.result !== "correct" || item.row.needs_sync;
    if (filter === "renewals") return item.periodEnd && ["active", "past_due", "trialing"].includes(item.status) && new Date(item.periodEnd).getTime() <= now + 7 * 86400000;
    return true;
  });
  const pageLink = (next: number) => `/admin/live-room?page=${next}&view=${encodeURIComponent(filter)}`;
  const pages = Math.max(1, Math.ceil(audit.total / 25));
  return (
    <section className="min-w-0 space-y-5 border-t border-[var(--color-border)] pt-6" aria-labelledby="membership-audit-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 id="membership-audit-heading" className="text-xl font-semibold text-white">Control de membresías</h2><p className="mt-2 text-sm text-[var(--color-text-secondary)]">Comprobado: {date(audit.checkedAt)} · America/Chicago · {audit.mode ? "Producción" : "Pruebas"}</p></div>
        <form action={refreshAudit}><input type="hidden" name="page" value={page} /><input type="hidden" name="view" value={filter} /><button type="submit" className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-white">Actualizar revisión</button></form>
      </div>
      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">Derecho según Stripe frente al rol real de miembro de sala en Discord. Los permisos de administrador y las excepciones de canal requieren revisión aparte.</p>
      <nav aria-label="Vistas de membresías" className="flex flex-wrap gap-2">
        {[["all", "Todas"], ["issues", "Incidencias"], ["renewals", "Vencimientos en 7 días"]].map(([key, label]) => <Link key={key} prefetch={false} href={`/admin/live-room?page=${page}&view=${key}`} aria-current={filter === key ? "page" : undefined} className={`rounded-md border px-3 py-2 text-sm ${filter === key ? "border-[var(--color-cyan)] text-[var(--color-cyan)]" : "border-[var(--color-border)] text-white"}`}>{label}</Link>)}
      </nav>
      <p className="text-xs text-[var(--color-text-secondary)]">Página {page} de {pages} · {audit.total} cuentas · filtros sobre las 25 cuentas de esta página.</p>
      <div className="max-w-full overflow-x-auto rounded-md border border-[var(--color-border)]">
        <table className="w-full min-w-[980px] text-left text-sm">
          <caption className="sr-only">Comparación de suscripciones y roles de Discord</caption>
          <thead className="bg-white/5 text-[var(--color-text-secondary)]"><tr>{["Usuario / Discord", "Stripe", "Fin de periodo", "Debería tener rol", "Tiene rol real", "Resultado", "Control"].map((heading) => <th key={heading} scope="col" className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead>
          <tbody>{rows.map((item) => {
            const profile = profiles.get(item.row.profile_id);
            const upcoming = item.periodEnd && ["active", "past_due", "trialing"].includes(item.status);
            return <tr key={item.row.profile_id} className="border-t border-[var(--color-border)] align-top">
              <td className="max-w-[240px] px-4 py-4 break-words"><Link className="font-semibold text-white underline decoration-white/30" href={`/admin/students/${item.row.profile_id}`}>{profile?.full_name || profile?.email || "Usuario"}</Link><div className="mt-1 text-xs text-[var(--color-text-secondary)]">{profile?.email}</div><div className="mt-2">{item.row.discord_name ?? "Sin Discord vinculado"}</div><div className="mt-1 text-xs text-[var(--color-text-secondary)]">{item.row.discord_user_id}</div></td>
              <td className="px-4 py-4"><div>{states[item.status] ?? "Sin verificar"}</div><div className="mt-2 text-xs text-[var(--color-text-secondary)]">Factura: {item.stripeError ? "sin verificar" : item.invoiceStatus === "paid" ? "pagada" : item.invoiceStatus === "open" ? "pendiente" : item.invoiceStatus ?? "sin factura"}</div>{item.cancelAtEnd && <div className="mt-2 text-xs text-amber-300">No renovará</div>}</td>
              <td className="px-4 py-4"><div>{date(item.periodEnd)}</div>{upcoming && <div className="mt-2 text-xs text-[var(--color-text-secondary)]">{item.cancelAtEnd ? "Fin de acceso previsto" : "Renovación prevista"}</div>}</td>
              <td className="px-4 py-4">{yesNo(item.expected)}</td>
              <td className="px-4 py-4">{yesNo(item.actual)}{item.inServer === false && <div className="mt-2 text-xs">Fuera del servidor</div>}</td>
              <td className="px-4 py-4"><span className={item.result === "correct" ? "text-emerald-300" : item.result === "unknown" ? "text-amber-300" : "text-red-300"}>{results[item.result]}</span>{item.row.needs_sync && <div className="mt-2 text-xs text-amber-300">Sincronización pendiente</div>}{item.stripeError && <div className="mt-2 text-xs">Stripe no verificable</div>}{item.discordError && <div className="mt-2 text-xs">Discord no verificable</div>}</td>
              <td className="px-4 py-4"><form action={syncAccount}><input type="hidden" name="profileId" value={item.row.profile_id} /><input type="hidden" name="page" value={page} /><button className="rounded-md border border-[var(--color-border)] px-3 py-2 text-xs text-white" type="submit">Sincronizar</button></form>{upcoming && !item.stripeError && <a href={`/admin/live-room/alerts/${item.row.profile_id}`} className="mt-3 block text-xs text-[var(--color-cyan)] underline">Recordatorios de calendario</a>}<a target="_blank" rel="noopener noreferrer" className="mt-3 block text-xs text-[var(--color-cyan)] underline" href={`https://dashboard.stripe.com/${audit.mode ? "" : "test/"}subscriptions/${item.row.stripe_subscription_id ?? ""}`}>Ver en Stripe</a></td>
            </tr>;
          })}{!rows.length && <tr><td colSpan={7} className="px-4 py-6 text-[var(--color-text-secondary)]">No hay cuentas en esta vista de la página.</td></tr>}</tbody>
        </table>
      </div>
      <div className="flex justify-between gap-4 text-sm text-[var(--color-cyan)]">{page > 1 ? <Link prefetch={false} href={pageLink(page - 1)}>Anterior</Link> : <span />}{page < pages && <Link prefetch={false} href={pageLink(page + 1)}>Siguiente</Link>}</div>
      <section className="border-t border-[var(--color-border)] pt-5"><h3 className="font-semibold text-white">Roles sin cuenta vinculada</h3>
        {!audit.inventory ? <p className="mt-2 text-sm text-amber-300">No se pudo obtener el inventario del servidor. No se puede confirmar si hay roles asignados a usuarios sin cuenta vinculada.</p> : <><p className="mt-2 text-sm text-[var(--color-text-secondary)]">{audit.inventory.complete ? "Inventario del servidor completo." : "Inventario parcial: no se ha revisado todo el servidor."} No se retiran roles automáticamente desde esta lista.</p>{audit.inventory.unlinked.length ? <ul className="mt-3 space-y-2 text-sm text-amber-300">{audit.inventory.unlinked.map((member) => <li key={member.id} className="break-words">{member.name} · {member.id} · Revisar asignación manual</li>)}</ul> : <p className="mt-3 text-sm text-emerald-300">No se encontraron roles sin cuenta vinculada en el inventario revisado.</p>}</>}
      </section>
      <p className="text-xs leading-6 text-[var(--color-text-secondary)]">Los recordatorios incluyen la fecha de renovación o fin de acceso y una revisión 24 horas después. Son una copia del periodo actual; las notificaciones dependen de tu calendario y deben actualizarse si cambia la fecha. No confirman impagos ni sustituyen esta revisión.</p>
    </section>
  );
}
