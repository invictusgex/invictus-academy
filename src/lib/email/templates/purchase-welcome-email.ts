import "server-only";

import { siteName } from "@/config/site";
import { escapeHtml } from "@/lib/email/email-template-utils";

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

  const text = [
    `${getGreeting(input.fullName)}.`,
    "",
    `Tu acceso a ${input.productTitle} ya fue activado correctamente.`,
    "",
    "Desde este momento puedes ingresar al Centro de Formación, revisar el programa y comenzar tu recorrido académico.",
    "",
    `Acceder al Centro de Formación: ${input.academyUrl}`,
    "",
    "Gracias por confiar en Invictus GEX.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#071018;color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#071018;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0b1620;border:1px solid #1f3446;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;border-bottom:1px solid #1f3446;">
                <p style="margin:0 0 8px;color:#67e8f9;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Invictus GEX</p>
                <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;">Tu acceso fue activado</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 18px;color:#f8fafc;font-size:16px;line-height:1.65;">${greeting}.</p>
                <p style="margin:0 0 18px;color:#cbd5e1;font-size:15px;line-height:1.7;">Tu acceso a <strong style="color:#ffffff;">${productTitle}</strong> ya fue activado correctamente.</p>
                <p style="margin:0 0 24px;color:#cbd5e1;font-size:15px;line-height:1.7;">Desde este momento puedes ingresar al Centro de Formación, revisar el programa y comenzar tu recorrido académico con una estructura clara.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td>
                      <a href="${academyUrl}" style="display:inline-block;background:#67e8f9;color:#071018;text-decoration:none;font-size:14px;font-weight:700;border-radius:999px;padding:14px 22px;">Acceder al Centro de Formación</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">Si el boton no funciona, copia y pega este enlace en tu navegador:<br /><a href="${academyUrl}" style="color:#67e8f9;text-decoration:none;">${academyUrl}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background:#08121b;border-top:1px solid #1f3446;">
                <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">Invictus GEX · Programa de Formación Profesional</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    html,
    subject,
    text,
  };
}
