# Experiencia de emails transaccionales

Este documento registra la configuracion actual para los emails visibles al
participante.

## Confirmacion de correo en Supabase Auth

El correo de confirmacion de registro lo envia Supabase Auth. Su diseno no se
lee desde el codigo de Next.js, sino desde:

Supabase Dashboard -> Authentication -> Email Templates -> Confirm signup.

La plantilla debe usar `{{ .ConfirmationURL }}` como destino del boton. No se
deben escribir dominios, tokens ni rutas manuales dentro del enlace principal.

### Asunto recomendado

```text
Confirma tu acceso a Invictus GEX
```

### Plantilla HTML recomendada

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Confirma tu acceso a Invictus GEX</title>
  </head>
  <body style="margin:0;background:#071018;color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#071018;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#0b1620;border:1px solid #1f3446;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;border-bottom:1px solid #1f3446;">
                <p style="margin:0 0 8px;color:#67e8f9;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Invictus GEX</p>
                <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;">Confirma tu correo electronico</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 18px;color:#f8fafc;font-size:16px;line-height:1.65;">Hola.</p>
                <p style="margin:0 0 18px;color:#cbd5e1;font-size:15px;line-height:1.7;">Gracias por registrarte en Invictus GEX. Confirma tu correo para activar tu cuenta y continuar con el acceso a la plataforma.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td>
                      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#67e8f9;color:#071018;text-decoration:none;font-size:14px;font-weight:700;border-radius:999px;padding:14px 22px;">Confirmar correo</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">Si el boton no funciona, copia y pega este enlace en tu navegador:<br /><a href="{{ .ConfirmationURL }}" style="color:#67e8f9;text-decoration:none;">{{ .ConfirmationURL }}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background:#08121b;border-top:1px solid #1f3446;">
                <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">Invictus GEX · Programa de Formacion Profesional</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
```

## Bienvenida posterior a la compra

El correo de bienvenida se envia desde el webhook de Stripe despues de que:

1. Stripe confirma `payment_intent.succeeded`.
2. La compra interna queda en estado `paid`.
3. El fulfillment concede o reutiliza el enrollment.
4. El webhook queda marcado como procesado.

El envio de bienvenida es no critico: si el proveedor de email falla, no se
revierte la compra ni el acceso academico.

## Variables requeridas

```text
EMAIL_PROVIDER=resend
EMAIL_FROM=Invictus GEX <formacion@invictusgex.com>
EMAIL_REPLY_TO=invictusgex@gmail.com
EMAIL_WELCOME_ENABLED=true
RESEND_API_KEY=
```

`RESEND_API_KEY` es secreto y debe configurarse solo en el entorno seguro del
hosting. No debe versionarse.

## Validacion operativa

Antes de probar en produccion:

1. Verificar dominio remitente en Resend.
2. Configurar variables en Hostinger.
3. Reiniciar o redeployar la aplicacion.
4. Ejecutar una compra de prueba en Stripe test.
5. Confirmar que el acceso se activa aunque el email no se entregue.

## Logo visible en clientes de correo

La imagen pequeña que Gmail, Apple Mail, Yahoo u otros clientes muestran junto
al remitente no se controla desde el HTML del correo. Cada proveedor decide si
muestra iniciales, foto de contacto, imagen de cuenta, Apple Branded Mail o un
logo BIMI.

Para Invictus GEX se preparo un logo BIMI publico:

```text
https://invictusgex.com/brand/bimi-logo.svg
```

Archivo del proyecto:

```text
public/brand/bimi-logo.svg
```

### Estado DNS actual verificado

- DMARC existe y esta en enforcement:

```text
v=DMARC1; p=quarantine; pct=100;
```

- DKIM de Resend existe para `resend._domainkey.invictusgex.com`.
- No existe todavia `default._bimi.invictusgex.com`.

### Registro DNS BIMI recomendado

Crear en el DNS del dominio:

```text
Type: TXT
Name: default._bimi
Value: v=BIMI1; l=https://invictusgex.com/brand/bimi-logo.svg;
TTL: 3600 o Automatico
```

Este registro permite que proveedores compatibles detecten el logo. Para Gmail
y otros clientes con validacion estricta puede hacer falta un certificado BIMI
CMC o VMC. En ese caso el registro se ampliaria con `a=...` apuntando al
certificado PEM publico.

### Pasos manuales en Resend

1. Entrar en Resend.
2. Abrir Domains.
3. Confirmar que `invictusgex.com` o el subdominio remitente figure como
   `verified`.
4. Confirmar que SPF y DKIM esten verificados.
5. Crear una API key para envio transaccional.
6. Guardar esa API key solo en Hostinger como `RESEND_API_KEY`.
7. Enviar desde un remitente del dominio verificado:

```text
Invictus GEX <formacion@invictusgex.com>
```

### Pasos manuales en Hostinger

Configurar variables de entorno de produccion:

```text
EMAIL_PROVIDER=resend
EMAIL_FROM=Invictus GEX <formacion@invictusgex.com>
EMAIL_REPLY_TO=invictusgex@gmail.com
EMAIL_WELCOME_ENABLED=true
RESEND_API_KEY=valor_real_de_resend
```

Despues de guardar las variables, reiniciar o redesplegar la aplicacion para que
Next.js las lea en runtime.
