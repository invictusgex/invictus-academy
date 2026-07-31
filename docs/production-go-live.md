# Production go-live

Plan operativo para publicar Invictus Trading Academy cuando el despliegue sea
autorizado.

## Objetivo

Publicar la aplicacion con Supabase production, Stripe Live y hosting
configurado, manteniendo acceso academico, checkout, webhook y storage privado
bajo control.

## Orden recomendado

1. Congelar cambios funcionales.
2. Confirmar que `main` esta sincronizada con `origin/main`.
3. Ejecutar auditoria final de secretos.
4. Configurar Supabase production.
5. Aplicar migraciones solo con autorizacion explicita.
6. Regenerar `src/lib/supabase/database.types.ts` si cambia el schema.
7. Configurar variables production en Hostinger.
8. Configurar Stripe Live y webhook Live.
9. Ejecutar build production.
10. Desplegar en Hostinger.
11. Probar smoke test publico.
12. Probar smoke test autenticado.
13. Probar checkout con importe real solo cuando el negocio lo autorice.

## Smoke tests publicos

- `/` carga correctamente.
- `/programa` carga correctamente.
- `/oferta` carga correctamente.
- `robots.txt` responde.
- `sitemap.xml` responde.
- `manifest.webmanifest` responde.
- No hay errores visibles en consola del navegador.

## Smoke tests privados

- Login funciona.
- Dashboard carga para alumno con Enrollment activo.
- Alumno sin acceso queda bloqueado correctamente.
- Admin puede entrar a `/admin`.
- Admin puede leer alumnos, contenido y escenarios.
- Recursos privados se resuelven con signed URLs.
- Recursos privados no son publicos por URL directa del bucket.

## Smoke tests comerciales

- Checkout usa solo `productSlug` desde cliente.
- Price se obtiene server-side desde `STRIPE_MENTORSHIP_PRICE_ID`.
- Webhook verifica firma.
- Purchase pasa por estados validos.
- Fulfillment academico concede Enrollment solo despues de pago confirmado.
- Refunds y disputes siguen la politica aprobada.

## Rollback

- Rollback de aplicacion: volver al despliegue anterior en Hostinger.
- Rollback de variables: restaurar snapshot anterior del panel del hosting.
- Rollback de base de datos: usar plan especifico de Supabase y nunca improvisar
  cambios destructivos.
- Rollback de Stripe: desactivar enlaces/Prices nuevos o pausar checkout desde
  configuracion server-side.

## Confirmaciones requeridas

- Supabase production listo.
- RLS production validado.
- Storage privado validado.
- Stripe Live autorizado.
- Webhook Live probado.
- Dominio HTTPS activo.
- Backups disponibles.
- Responsable comercial aprueba cobro real.
