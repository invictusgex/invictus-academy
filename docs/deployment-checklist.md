# Deployment checklist

Checklist de produccion para Invictus Trading Academy. Este documento prepara el
despliegue, pero no autoriza ejecutar `db push`, activar Stripe Live ni publicar
en Hostinger.

## Supabase Production

- Crear o confirmar proyecto Supabase production.
- Aplicar migraciones solo en una fase autorizada.
- Verificar RLS en todas las tablas sensibles.
- Confirmar policies de `profiles`, `enrollments`, `module_progress`,
  `academy_modules`, `academy_module_videos`, `academy_resources`,
  `purchases`, `purchase_events` y `stripe_webhook_events`.
- Confirmar grants endurecidos para `anon`, `authenticated` y `service_role`.
- Confirmar que alumnos no pueden escribir Enrollments ni Purchases.
- Confirmar que admins solo acceden por rutas protegidas con `RequireAdmin`.
- Confirmar que el bucket `academy-assets` permanece privado.
- Confirmar signed URLs para recursos internos.
- No usar `getPublicUrl` para assets privados.

## Stripe Live

- Mantener Stripe Live desactivado hasta autorizacion comercial.
- Crear producto y Price Live solo cuando se autorice.
- Configurar `STRIPE_MENTORSHIP_PRICE_ID` con el Price ID del entorno correcto.
- Confirmar que el Price es de pago unico, esta activo y pertenece al producto
  comercial aprobado.
- Crear Coupons y Promotion Codes desde Stripe Dashboard cuando la politica
  comercial los autorice.
- Limitar Promotion Codes por producto, usos maximos, expiracion, cliente o
  importe minimo segun corresponda.
- Configurar webhook Live apuntando a `/api/stripe/webhook`.
- Configurar solo eventos requeridos por el lifecycle comercial.
- Guardar `STRIPE_WEBHOOK_SECRET` en variables de produccion.
- Probar primero con Stripe test y entorno preview.

## Next.js

- Ejecutar `npm.cmd run lint`.
- Ejecutar `npm.cmd run build`.
- Confirmar `APP_URL` con dominio HTTPS canonico.
- Confirmar metadata, OpenGraph, Twitter Card, robots, sitemap, manifest y
  favicon.
- Confirmar headers de seguridad.
- Revisar que no haya imports muertos, `console.log` ni marcas temporales de
  desarrollo.

## Storage

- Mantener buckets privados para videos, recursos e imagenes internas.
- Validar extensiones, MIME type y tamano maximo.
- Guardar rutas internas, no URLs firmadas persistidas.
- Resolver URLs firmadas solo desde servicios autorizados.
- Confirmar expiracion razonable de signed URLs.

## Hostinger

- Crear aplicacion Node/Next.js en el panel de Hostinger cuando se autorice.
- Configurar version de Node compatible con `package.json`.
- Configurar comando de build: `npm.cmd run build` en local y equivalente del
  proveedor en produccion.
- Configurar comando de inicio: `npm run start`.
- Cargar variables de entorno en el panel seguro.
- Asociar dominio HTTPS antes de activar checkout real.
- No desplegar desde esta fase.

## Rollback

- Identificar ultimo commit estable antes del despliegue.
- Conservar migraciones versionadas.
- Si falla el despliegue, revertir a la version anterior desde el proveedor.
- Si falla una migracion production, detener cambios y usar el plan de rollback
  especifico de Supabase.
- No usar `git push --force` para recuperar produccion.

## Bloqueos antes de go-live

- Variables production incompletas.
- Stripe Live sin webhook verificado.
- RLS no validado en production.
- Bucket privado expuesto.
- Build fallando.
- Dominio sin HTTPS.
- `APP_URL` apuntando a local o preview.
