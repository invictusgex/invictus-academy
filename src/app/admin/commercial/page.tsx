import Link from "next/link";
import { requireAdminServerContext } from "@/app/admin/admin-auth";
export default async function CommercialPage() {
  await requireAdminServerContext();
  return <div className="space-y-5"><h1 className="text-3xl font-semibold">Oferta de mentoría privada</h1><p className="text-xl">349 USD · pago único</p><p className="max-w-2xl leading-8 text-[var(--color-text-secondary)]">Sesiones privadas en vivo, sin un número fijo, de hasta dos horas cada una, hasta completar la mentoría. Sin vídeos grabados ni etapas obligatorias. Fechas coordinadas entre profesor y alumno.</p><p className="text-sm text-[var(--color-text-secondary)]">Los códigos promocionales y los anuncios de descuentos están deshabilitados para esta oferta. El Checkout rechaza precios distintos de 349 USD.</p><Link className="inline-flex min-h-11 items-center rounded-lg border border-[var(--color-border)] px-5" href="/oferta">Ver presentación pública</Link></div>;
}
