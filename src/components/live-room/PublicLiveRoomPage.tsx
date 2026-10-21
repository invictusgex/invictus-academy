import Image from "next/image";
import Link from "next/link";

import { getSupportMailtoHref } from "@/config/site";
import { liveRoom } from "@/content/live-room";
import type { LiveRoomOffer } from "@/lib/types/live-room.types";

const primaryLink = "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-6 py-3 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-auto";
const textLink = "text-sm text-[var(--color-text-secondary)] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]";

export function PublicLiveRoomPage({ offer }: { offer: LiveRoomOffer }) {
  return (
    <div className="public-site min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)]">
      <header className="public-header mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]">
          <Image alt="" aria-hidden="true" src="/brand/invictus-gex-logo.png" width={32} height={32} className="h-8 w-8 rounded-full object-contain" />
          Invictus GEX
        </Link>
        <nav aria-label="Navegación de la sala" className="flex w-full flex-wrap items-center gap-x-6 gap-y-3 sm:w-auto">
          <Link href="/programa" className={textLink}>Formación</Link>
          <a href="#membresia" className={textLink}>Membresía</a>
          <a href={getSupportMailtoHref("Consulta sobre la sala privada en vivo")} className={textLink} style={{ display: "inline-flex" }}>Contacto</a>
        </nav>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-5 pt-12 pb-10 sm:px-6 sm:pt-20 lg:px-8">
          <p className="text-sm font-semibold text-[var(--color-cyan)] uppercase">Invictus GEX · Discord</p>
          <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-semibold text-white sm:text-5xl lg:text-6xl">{liveRoom.title}</h1>
          <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">{offer.description}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href={liveRoom.subscriptionHref} className={primaryLink}>Unirme a la sala</Link>
            <p className="text-sm text-[var(--color-text-secondary)]"><span className="font-semibold text-white">{offer.amountUsd} USD</span> / mes</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">Membresía mensual independiente del Programa de Formación.</p>
        </section>

        <div className="mx-auto w-full max-w-6xl px-5 pb-14 sm:px-6 lg:px-8">
          <figure className="m-0 border-y border-[var(--color-border)] py-5">
            <Image src="/visuals/sala-en-vivo-mercado.png" alt="Análisis de mercado con gráficos de precio, perfil de volumen, flujo de órdenes y exposición gamma." width={3472} height={1301} priority className="h-auto w-full object-contain" />
            <figcaption className="mt-4 text-xs leading-5 text-[var(--color-text-muted)]">Contexto, relaciones y escenarios: una lectura del mercado como sistema.</figcaption>
          </figure>
        </div>

        <section className="public-flow-section" aria-labelledby="live-room-experience">
          <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold text-[var(--color-cyan)] uppercase">La experiencia</p>
            <h2 id="live-room-experience" className="mt-4 max-w-2xl text-3xl leading-tight font-semibold text-white">La metodología, en diálogo con el mercado.</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {liveRoom.experiences.map((experience, index) => (
                <article key={experience.title} className="min-w-0 border-t border-[var(--color-border)] pt-5">
                  <span className="text-xs font-semibold text-[var(--color-cyan)]">0{index + 1}</span>
                  <h3 className="mt-4 text-xl font-semibold text-white">{experience.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{experience.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="membresia" aria-labelledby="membership-title" className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-20">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-cyan)] uppercase">Tu membresía</p>
            <h2 id="membership-title" className="mt-4 text-3xl leading-tight font-semibold text-white">Un espacio al que volver cada mes.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-text-secondary)]">Accede a la sala privada en Discord y comparte el análisis en vivo junto al mentor. La membresía tiene renovación mensual automática.</p>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">La sala es una experiencia compartida. La mentoría privada individual 1 a 1 sigue formando parte del Programa de Formación.</p>
          </div>
          <div className="min-w-0 border-t border-[var(--color-border)] pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <p className="text-sm text-[var(--color-text-secondary)]">Sala privada en vivo · Discord</p>
            <p className="mt-5 text-5xl font-semibold text-white">{offer.amountUsd}<span className="ml-2 text-lg font-normal text-[var(--color-text-secondary)]">USD / mes</span></p>
            <p className="mt-5 text-sm leading-7 text-[var(--color-text-secondary)]">Crea tu cuenta o inicia sesión antes de suscribirte. Después, vincula tu cuenta de Discord para acceder con tu membresía activa.</p>
            <Link href={liveRoom.subscriptionHref} className={`${primaryLink} mt-7`}>Unirme a la sala</Link>
            <p className="mt-5 text-xs leading-6 text-[var(--color-text-muted)]">Análisis educativo. No se prometen resultados financieros ni rentabilidad.</p>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 border-t border-[var(--color-border)] px-5 py-8 text-sm text-[var(--color-text-muted)] sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p>Invictus GEX</p>
        <Link href="/programa" className={textLink}>Conocer el Programa de Formación</Link>
      </footer>
    </div>
  );
}
