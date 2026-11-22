"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function CheckoutStartPage({ productSlug }: { productSlug: string; promotion?: unknown }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function start() {
    if (pending) return;
    setPending(true); setError("");
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productSlug }) });
      const data = await response.json();
      if (data.url) { window.location.assign(data.url); return; }
      if (data.error?.code === "ALREADY_ENROLLED") { router.replace("/academy"); return; }
      if (data.error?.code === "UNAUTHENTICATED") { router.replace("/login?next=%2Fcheckout%2Fstart"); return; }
      throw new Error(data.error?.message || "No se pudo preparar el pago.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "No se pudo conectar."); setPending(false); }
  }
  return <main className="min-h-screen bg-[var(--color-page-bg)] px-5 py-16 text-white"><section className="mx-auto max-w-2xl"><Link href="/oferta" className="text-sm text-[var(--color-cyan)]">Volver a la mentoría</Link><h1 className="mt-8 text-3xl font-semibold">Mentoría privada Invictus GEX</h1><p className="mt-6 text-3xl font-semibold">349 USD <span className="text-base font-normal">· pago único</span></p><p className="mt-6 leading-8 text-[var(--color-text-secondary)]">Sesiones individuales en vivo, sin un número fijo, de hasta dos horas cada una, hasta completar la mentoría. Fechas coordinadas entre profesor y alumno. Sin vídeos grabados ni evaluación previa.</p><p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">La sala compartida de Discord se contrata por separado.</p><button onClick={() => void start()} disabled={pending} className="mt-8 min-h-12 rounded-lg bg-[var(--color-cyan)] px-6 py-3 font-semibold text-[#051019] disabled:opacity-60">{pending ? "Preparando pago seguro…" : "Pagar 349 USD"}</button>{error && <p role="alert" className="mt-5 text-amber-300">{error}</p>}</section></main>;
}
