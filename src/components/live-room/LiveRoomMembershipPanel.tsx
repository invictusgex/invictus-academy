"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  discordName: string | null;
  active: boolean;
  hasSubscription: boolean;
  paidThrough: string | null;
  cancelling: boolean;
  channelUrl: string | null;
  amountUsd: number;
  available: boolean;
  setupPending: boolean;
  syncOnLoad: boolean;
  discordError: boolean;
};
const buttonClass = "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 py-3 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]";

export function LiveRoomMembershipPanel(props: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);
  const syncStarted = useRef(false);

  async function act(action: "connect" | "checkout" | "portal" | "sync") {
    setBusy(true); setError(null);
    try {
      const response = await fetch("/api/live-room/membership", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No pudimos actualizar tu membresía.");
      if (typeof result.url === "string") { window.location.assign(result.url); return; }
      setSynced(true);
      router.replace("/sala-en-vivo/suscripcion");
      router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No pudimos conectar con el servidor."); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    if (!props.syncOnLoad || props.setupPending || syncStarted.current) return;
    syncStarted.current = true;
    void act("sync");
    // Sync once after Stripe returns; access still comes from server verification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.syncOnLoad, props.setupPending]);

  return (
    <div className="space-y-5">
      {props.setupPending ? <p role="status" className="text-sm leading-7 text-[var(--color-text-secondary)]">Estamos preparando la suscripción. Todavía no se ha habilitado el pago.</p> : (
        <>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{props.discordName ? `Discord vinculado: ${props.discordName}` : "Vincula tu cuenta de Discord para que podamos activar tu acceso después del pago. Autorizarás tu identificación y la incorporación a nuestro servidor."}</p>
          {!props.discordName ? <button disabled={busy} onClick={() => void act("connect")} className={buttonClass}>{busy ? "Conectando..." : "Vincular mi Discord"}</button> : null}
          {props.discordName ? <button disabled={busy} onClick={() => void act("connect")} className="text-sm text-[var(--color-text-secondary)] underline underline-offset-4">Volver a vincular Discord</button> : null}
          {props.active && props.channelUrl ? (
            <a href={props.channelUrl} className={buttonClass}>Entrar a la sala</a>
          ) : props.discordName && !props.hasSubscription && props.available ? (
            <>
              <p className="text-lg font-semibold text-white">{props.amountUsd} USD / mes</p>
              <p className="text-xs leading-6 text-[var(--color-text-muted)]">Renovación automática mensual. Puedes gestionar la cancelación desde tu membresía.</p>
              <button disabled={busy} onClick={() => void act("checkout")} className={buttonClass}>{busy ? "Preparando pago..." : "Suscribirme a la sala"}</button>
            </>
          ) : props.hasSubscription && !props.active ? <p role="status" className="text-sm leading-7 text-[var(--color-text-secondary)]">Tu membresía necesita una comprobación o una actualización de pago. Revisa su estado antes de continuar.</p> : null}
          {props.active ? <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{props.cancelling ? "La renovación está cancelada. Conservas el acceso hasta terminar el periodo pagado." : "Tu membresía está activa."}{props.paidThrough ? ` Periodo pagado hasta ${new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" }).format(new Date(props.paidThrough))} (UTC).` : ""}</p> : null}
          {props.hasSubscription ? <button disabled={busy} onClick={() => void act("portal")} className="w-full rounded-full border border-[var(--color-border)] px-5 py-3 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-cyan)]">Gestionar membresía</button> : null}
          {props.discordName ? <button disabled={busy} onClick={() => void act("sync")} className="text-sm text-[var(--color-cyan)] underline underline-offset-4 disabled:opacity-60">{busy ? "Verificando..." : "Verificar mi acceso"}</button> : null}
        </>
      )}
      {props.discordError ? <p role="alert" className="text-sm leading-6 text-red-300">No pudimos vincular Discord. Intenta de nuevo; asegúrate de autorizar la cuenta que quieres utilizar.</p> : null}
      {error ? <p role="alert" className="text-sm leading-6 text-red-300">{error}</p> : null}
      {synced && !error ? <p role="status" className="text-sm text-[var(--color-cyan)]">Estado de la membresía actualizado.</p> : null}
      <Link href="/sala-en-vivo" className="inline-flex text-sm text-[var(--color-text-secondary)] underline underline-offset-4">Volver a la sala</Link>
    </div>
  );
}
