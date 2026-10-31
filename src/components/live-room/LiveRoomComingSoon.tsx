import Image from "next/image";
import Link from "next/link";
import { PublicBackgroundField } from "@/components/public/PublicBackgroundField";
import { PublicSiteMotion } from "@/components/public/PublicSiteMotion";
import { LiveRoomWaitlistForm } from "./LiveRoomWaitlistForm";
import { liveRoom } from "@/content/live-room";
import type { LiveRoomOffer } from "@/lib/types/live-room.types";

export function LiveRoomComingSoon({ offer }: { offer: LiveRoomOffer }) {
  return <div className="public-site room-coming-soon relative isolate min-h-screen bg-[var(--color-page-bg)] text-white">
    <PublicSiteMotion /><PublicBackgroundField />
    <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-6">
      <Link href="/" className="flex items-center gap-3 font-semibold"><Image src="/brand/invictus-gex-logo.png" width={36} height={36} alt="" />Invictus GEX</Link>
      <nav className="flex flex-wrap gap-5 text-sm text-[var(--color-text-secondary)]" aria-label="Sala en vivo"><Link href="/">Inicio</Link><Link href="/programa">Formación</Link><Link href={liveRoom.subscriptionHref}>Mi membresía</Link></nav>
    </header>
    <main className="relative z-10">
      <section className="mx-auto w-full max-w-6xl px-5 pt-12 pb-14 sm:pt-20">
        <p className="font-semibold text-[var(--color-cyan)]">INVICTUS GEX · DISCORD</p>
        <h1 className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl">Sala privada en vivo</h1>
        <p className="mt-6 text-4xl leading-tight font-bold text-[var(--color-cyan)] sm:text-6xl">Comenzará pronto</p>
        <p className="mt-5 text-lg font-semibold">Las inscripciones abrirán próximamente.</p>
        <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-8 text-[var(--color-text-secondary)]">{offer.description}</p>
        <p className="mt-6 text-2xl font-semibold">{offer.amountUsd} USD <span className="text-base font-normal text-[var(--color-text-secondary)]">/ mes al abrir las inscripciones</span></p>
        <a href="#lista-interesados" className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-[var(--color-cyan)] px-6 font-semibold text-[#051019]">Estoy interesado</a>
        <p className="mt-4 text-sm text-[var(--color-text-secondary)]">Membresía independiente del Programa de Formación.</p>
      </section>
      <section className="border-y border-[var(--color-border)]" aria-labelledby="room-experience">
        <div className="mx-auto max-w-6xl px-5 py-12"><h2 id="room-experience" className="text-2xl font-semibold">La metodología, en diálogo con el mercado.</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">{liveRoom.experiences.map(item => <article key={item.title}><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{item.description}</p></article>)}</div>
          <p className="mt-8 text-sm leading-7 text-[var(--color-text-secondary)]">Análisis educativo compartido en Discord. No es una mentoría individual ni una promesa de rentabilidad.</p>
        </div>
      </section>
      <section id="lista-interesados" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-14"><h2 className="text-3xl font-semibold">Sé de los primeros en enterarte.</h2><p className="mt-4 max-w-xl leading-7 text-[var(--color-text-secondary)]">Deja tu correo y te avisaremos cuando puedas inscribirte. Todavía no hay una fecha de apertura anunciada.</p><LiveRoomWaitlistForm /></section>
    </main>
  </div>;
}
