"use client";

import { useState } from "react";

export function LiveRoomWaitlistForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  return <form className="mt-7 max-w-xl space-y-4" onSubmit={async (event) => {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/live-room/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), consent: data.get("consent") === "on", website: data.get("website") }) });
      const result = await response.json();
      setSuccess(response.ok); setMessage(result.message ?? result.error);
    } catch { setSuccess(false); setMessage("No pudimos conectar. Inténtalo de nuevo."); }
    finally { setPending(false); }
  }}>
    {!success && <>
      <label htmlFor="waitlist-email" className="block font-semibold text-white">Tu correo electrónico</label>
      <input id="waitlist-email" name="email" type="email" autoComplete="email" maxLength={254} required className="min-h-12 w-full rounded-lg border border-[var(--color-border)] bg-[#091622] px-4 text-white focus:outline-2 focus:outline-cyan-400" />
      <div hidden><label>Sitio web<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="flex items-start gap-3 text-sm leading-6 text-[var(--color-text-secondary)]"><input className="mt-1 h-4 w-4 shrink-0 accent-cyan-400" type="checkbox" name="consent" required />Quiero recibir por correo el aviso de apertura de la sala privada en vivo. Mi correo se utilizará para este aviso; puedo solicitar mi baja escribiendo a invictusgex@gmail.com.</label>
      <button disabled={pending} className="min-h-12 rounded-lg bg-[var(--color-cyan)] px-6 py-3 font-semibold text-[#051019] disabled:opacity-60">{pending ? "Guardando…" : "Unirme a la lista"}</button>
      <p className="text-xs leading-6 text-[var(--color-text-muted)]">Sin cuenta, sin pago y sin compromiso de suscripción.</p>
    </>}
    {message && <p role={success ? "status" : "alert"} className={success ? "text-emerald-300" : "text-amber-300"}>{message}</p>}
  </form>;
}
