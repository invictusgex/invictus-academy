import "server-only";

import { siteName } from "@/config/site";
import { escapeHtml } from "@/lib/email/email-template-utils";
import { buildBrandedEmailLayout } from "@/lib/email/templates/branded-email";

type PurchaseWelcomeEmailInput = {
  academyUrl: string;
  fullName: string | null;
  productTitle: string;
};

function getGreeting(fullName: string | null) {
  return fullName ? `Hola, ${fullName}` : "Hola";
}

export function buildPurchaseWelcomeEmail(input: PurchaseWelcomeEmailInput) {
  const greeting = escapeHtml(getGreeting(input.fullName));
  const productTitle = escapeHtml(input.productTitle);
  const academyUrl = escapeHtml(input.academyUrl);
  const subject = `Bienvenido a ${siteName}`;
  const preheader =
    "Tu acceso a Invictus GEX fue activado. Ya puedes ingresar al Centro de Formación.";

  const text = [
    `${getGreeting(input.fullName)}.`,
    "",
    `Tu acceso a ${input.productTitle} ya fue activado correctamente.`,
    "",
    "Ingresa al Centro de Formación para comenzar tu recorrido, revisar el programa y avanzar con estructura.",
    "",
    `Acceder al Centro de Formación: ${input.academyUrl}`,
    "",
    "Invictus GEX · Programa de Formación Profesional",
  ].join("\n");

  const bodyHtml = `
    <p style="margin:0 0 12px;color:#22d3ee;font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">Acceso confirmado</p>
    <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.18;font-weight:800;">Bienvenido a Invictus GEX</h1>
    <p style="margin:20px 0 0;color:#f8fafc;font-size:16px;line-height:1.65;">${greeting}.</p>
    <p style="margin:14px 0 0;color:#cbd5e1;font-size:15px;line-height:1.75;">Tu acceso a <strong style="color:#ffffff;">${productTitle}</strong> ya fue activado correctamente.</p>
    <p style="margin:14px 0 26px;color:#cbd5e1;font-size:15px;line-height:1.75;">A partir de ahora puedes ingresar al Centro de Formación, revisar la estructura del programa y comenzar tu recorrido académico con orden, evidencia y preparación.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
      <tr>
        <td style="border-radius:999px;background:#22d3ee;box-shadow:0 14px 34px rgba(34,211,238,0.22);">
          <a href="${academyUrl}" style="display:inline-block;color:#05070c;text-decoration:none;font-size:14px;font-weight:800;border-radius:999px;padding:15px 24px;">Acceder al Centro de Formación</a>
        </td>
      </tr>
    </table>
    <div style="border:1px solid #123449;border-radius:16px;background:rgba(7,17,31,0.72);padding:16px 18px;">
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.7;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p style="margin:8px 0 0;color:#22d3ee;font-size:13px;line-height:1.6;word-break:break-all;"><a href="${academyUrl}" style="color:#22d3ee;text-decoration:none;">${academyUrl}</a></p>
    </div>`;

  const html = buildBrandedEmailLayout({
    bodyHtml,
    preheader,
    subject: escapeHtml(subject),
  });

  return {
    html,
    subject,
    text,
  };
}
