# Environment variables

Este documento define las variables necesarias para operar Invictus Trading
Academy en local, preview y produccion.

No incluir valores reales en Git. Los secretos deben vivir solo en `.env.local`
para desarrollo o en el panel seguro del proveedor de hosting.

## Separacion por entorno

### Local

- Archivo recomendado: `.env.local`.
- Puede usar Supabase local o proyecto remoto de pruebas.
- Stripe debe permanecer en modo test.
- No usar claves live.

### Preview

- Configurar variables en el panel del hosting para el entorno preview.
- Usar proyecto Supabase y webhook Stripe de pruebas o staging.
- `APP_URL` debe apuntar al dominio preview exacto.

### Production

- Configurar variables en el panel del hosting para produccion.
- Usar proyecto Supabase production.
- Usar Stripe Live solo cuando el go-live comercial sea autorizado.
- `APP_URL` debe apuntar al dominio canonico HTTPS.

## Variables publicas

Estas variables pueden estar disponibles en el cliente porque usan el prefijo
`NEXT_PUBLIC_`.

| Variable | Requerida | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Si | Email publico del soporte global de la academia. |
| `NEXT_PUBLIC_SUPABASE_URL` | Si | URL publica del proyecto Supabase del entorno. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Si | Anon key publica de Supabase, protegida por RLS. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Si | Publishable key de Stripe para operaciones cliente presentes o futuras. |

## Variables solo servidor

Estas variables no deben tener prefijo `NEXT_PUBLIC_`.

| Variable | Requerida | Uso |
| --- | --- | --- |
| `APP_URL` | Si | URL base canonica para metadata y redirecciones Stripe. |
| `SUPABASE_SERVICE_ROLE_KEY` | Si | Operaciones server-only que requieren privilegios administrativos. |
| `STRIPE_SECRET_KEY` | Si | Cliente Stripe server-only. |
| `STRIPE_MENTORSHIP_PRICE_ID` | Si | Price autorizado para Trading Basado en Datos. |
| `STRIPE_WEBHOOK_SECRET` | Si | Verificacion de firma del webhook Stripe. |

## Reglas

- No commitear `.env`, `.env.local` ni variantes locales.
- No exponer `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` ni
  `STRIPE_WEBHOOK_SECRET` en componentes cliente.
- Mantener `APP_URL` con `https://` en produccion.
- Mantener variables de Stripe test hasta autorizar Stripe Live.
- Regenerar webhooks por entorno; no reutilizar secretos entre local, preview y
  produccion.

## Checklist por entorno

- Confirmar que todas las variables de `.env.example` existen en el entorno.
- Confirmar que no hay valores vacios en produccion.
- Confirmar que las claves Supabase pertenecen al proyecto correcto.
- Confirmar que las claves Stripe pertenecen al modo correcto.
- Confirmar que `APP_URL` coincide con el dominio desde el que se sirve la app.
- Ejecutar `npm.cmd run build` despues de configurar variables.
