import "server-only";

type BrandedEmailInput = {
  bodyHtml: string;
  footerNote?: string;
  preheader: string;
  subject: string;
};

export function buildBrandedEmailLayout({
  bodyHtml,
  footerNote = "Invictus GEX · Programa de Formación Profesional",
  preheader,
  subject,
}: BrandedEmailInput) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;background:#05070c;color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">
      ${preheader}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#05070c;padding:32px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:separate;border-spacing:0;">
            <tr>
              <td style="border:1px solid #123449;border-radius:24px;overflow:hidden;background:#07111f;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:0;background:#05070c;">
                      <div style="height:128px;background:
                        linear-gradient(135deg, rgba(34,211,238,0.18), rgba(5,7,12,0.08) 42%, rgba(5,7,12,0.85)),
                        repeating-linear-gradient(90deg, rgba(34,211,238,0.12) 0 1px, transparent 1px 42px),
                        repeating-linear-gradient(180deg, rgba(34,211,238,0.08) 0 1px, transparent 1px 34px);
                        border-bottom:1px solid #123449;">
                        <table role="presentation" width="100%" height="128" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding:28px 30px;vertical-align:bottom;">
                              <p style="margin:0 0 10px;color:#22d3ee;font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">Invictus GEX</p>
                              <p style="margin:0;color:#f8fafc;font-size:13px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Programa de Formación Profesional</p>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px 30px 30px;background:
                      radial-gradient(circle at 100% 0%, rgba(34,211,238,0.09), transparent 34%),
                      linear-gradient(180deg, #07111f 0%, #05070c 100%);">
                      ${bodyHtml}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 30px;border-top:1px solid #123449;background:#060d17;">
                      <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">${footerNote}</p>
                      <p style="margin:10px 0 0;color:#64748b;font-size:11px;line-height:1.6;">Este mensaje fue enviado por una acción realizada en Invictus GEX. Si no reconoces esta actividad, puedes ignorar este correo o contactar soporte.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
