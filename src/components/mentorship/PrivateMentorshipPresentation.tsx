import Image from "next/image";
import Link from "next/link";
import { privateMentorship as offer } from "@/content/private-mentorship";
import { PublicBackgroundField } from "@/components/public/PublicBackgroundField";
import { PublicSiteMotion } from "@/components/public/PublicSiteMotion";
import { PublicTikTokLink } from "@/components/public/PublicTikTokLink";
import liveStyles from "@/components/landing/live-room.module.css";
import { getSupportMailtoHref } from "@/config/site";

const buy = "inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--color-cyan)] px-6 py-3 text-sm font-semibold text-[#051019] hover:bg-[var(--color-cyan-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300";

export function PrivateMentorshipPresentation() {
  return <div className="public-site mentorship-presentation relative isolate min-h-screen bg-[var(--color-page-bg)] text-white">
    <PublicSiteMotion /><PublicBackgroundField />
    <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-6">
      <Link href="/" className="flex items-center gap-3 font-semibold"><Image src="/brand/invictus-gex-logo.png" width={36} height={36} alt="" />INVICTUS GEX</Link>
      <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-4 text-sm"><a href="#mentoria">Mentoría</a><a href="#enfoque">Enfoque</a><Link className={`${liveStyles.live} ${liveStyles.link}`} href="/sala-en-vivo">Sala en vivo</Link><Link href="/academy">Mi mentoría</Link><PublicTikTokLink /></nav>
    </header>
    <main className="relative z-10">
      <section id="mentoria" className="mentorship-contained mx-auto px-5 pt-6 pb-10 sm:px-6 sm:pt-20 sm:pb-14">
        <p className="text-sm font-semibold text-[var(--color-cyan)]">EN VIVO · PROFESOR Y ALUMNO · ATENCIÓN INDIVIDUAL</p>
        <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-semibold sm:text-5xl">{offer.title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg sm:leading-8">{offer.description}</p>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">Mentoría directa, sin vídeos grabados ni etapas previas.</p>
        <div className="mt-8 grid grid-cols-2 items-center gap-4 sm:flex sm:flex-wrap sm:gap-6"><Link className={buy} href="/checkout/start">Adquirir mentoría</Link><p className="text-2xl font-semibold sm:text-3xl">349 USD <span className="block text-sm font-normal text-[var(--color-text-secondary)] sm:inline">pago único</span></p></div>
        <p className="mt-4 text-sm text-[var(--color-text-secondary)]">Sin evaluación de admisión. Sin suscripción mensual.</p>
      </section>
      <section className="border-y border-[var(--color-border)]"><div className="mentorship-contained mx-auto px-5 py-12 sm:px-6"><h2 className="text-3xl font-semibold">Una mentoría, varias sesiones.</h2><div className="mt-8 grid gap-8 md:grid-cols-3">
        <article><h3 className="text-lg font-semibold">Compra directa</h3><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">Tu pago activa el espacio privado para coordinar con el mentor y consultar la agenda.</p></article>
        <article><h3 className="text-lg font-semibold">Encuentros de hasta dos horas</h3><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">Profesor y alumno acuerdan las fechas y la duración de cada encuentro, con un máximo de dos horas por sesión en vivo. Las reservas se realizan desde el día siguiente, según America/Chicago.</p></article>
        <article><h3 className="text-lg font-semibold">Sin un número fijo de sesiones</h3><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">Un único pago incluye los encuentros necesarios para completar la mentoría. Cada sesión en vivo tiene una duración máxima de dos horas.</p></article>
      </div></div></section>
      <section id="enfoque" className="mentorship-contained mx-auto px-5 py-14 sm:px-6"><h2 className="text-3xl font-semibold">Un enfoque práctico e individual</h2><p className="mt-5 max-w-2xl leading-8 text-[var(--color-text-secondary)]">Aprendizaje directo con el mentor, análisis de mercado y práctica en vivo. Las explicaciones y los ejemplos se adaptan a tu ritmo durante las sesiones. No se promete disponibilidad permanente ni resultados financieros.</p>
        <Image className="mt-8 h-auto w-full border-y border-[var(--color-border)] py-5" src="/visuals/mentoria-analisis-mercado.png" alt="Tres gráficos de análisis de mercado con perfiles de volumen, flujo de órdenes y niveles gamma." width={4653} height={1295} sizes="(max-width: 768px) 100vw, 1152px" />
        <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">{offer.topics.map(topic => <article key={topic.title} className="border-t border-[var(--color-border)] pt-5"><h3 className="text-lg font-semibold">{topic.title}</h3><p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{topic.text}</p></article>)}</div>
      </section>
      <section className="border-y border-[var(--color-border)]"><div className="mentorship-contained mx-auto px-5 py-12 sm:px-6"><h2 className="text-3xl font-semibold">Antes de comenzar</h2><div className="mt-7 divide-y divide-[var(--color-border)]">
        {[
          ["¿Cuántas sesiones incluye?", "La compra no es un paquete limitado a una cantidad fija de encuentros. Incluye las sesiones necesarias para completar la mentoría, con un máximo de dos horas por sesión y sin pagar cada encuentro por separado."],
          ["¿Cuánto dura cada sesión?", "Cada sesión en vivo dura como máximo dos horas. Su duración concreta y su horario se coordinan entre profesor y alumno, dentro de ese límite."],
          ["¿Hay vídeos o módulos obligatorios?", "No. La formación es privada y directa en vivo; no hay vídeos grabados ni etapas obligatorias antes de reservar."],
          ["¿Necesito una evaluación para comprar?", "No. Puedes adquirir la mentoría directamente por 349 USD en un único pago."],
          ["¿Incluye la sala privada en vivo?", "No. La sala compartida de Discord es un producto independiente con su propia suscripción. La mentoría es individual."],
          ["¿Se garantiza rentabilidad?", "No. Es formación educativa sobre lectura de mercado y riesgo, sin promesas de ingresos o resultados financieros."],
        ].map(([question, answer]) => <details key={question} className="py-5"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">{answer}</p></details>)}
      </div></div></section>
      <section className="mentorship-contained mx-auto px-5 py-14 sm:px-6"><h2 className="text-3xl font-semibold">Comienza tu mentoría privada.</h2><p className="mt-4 max-w-xl leading-8 text-[var(--color-text-secondary)]">349 USD por la mentoría privada completa. Después de la compra, accedes a tu espacio privado para coordinar las fechas con el mentor.</p><div className="mt-7 flex flex-wrap items-center gap-6"><Link className={buy} href="/checkout/start">Adquirir mi mentoría</Link><a href={getSupportMailtoHref("Soporte de acceso y pago")} className="text-sm underline underline-offset-4">Soporte de acceso y pago</a></div></section>
    </main>
    <footer className="relative z-10 mx-auto max-w-6xl px-5 py-8 text-sm text-[var(--color-text-secondary)]">Invictus GEX · Mentoría privada</footer>
  </div>;
}
