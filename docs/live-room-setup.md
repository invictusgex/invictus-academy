# Sala privada en vivo: configuración y pruebas

Estado: integración local; requiere migración y pruebas con las plataformas antes de publicar.

## Variables exclusivamente del servidor

- `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`, `DISCORD_MEMBER_ROLE_ID`, `DISCORD_LIVE_CHANNEL_ID`
- `STRIPE_LIVE_ROOM_SECRET_KEY`: clave de la misma cuenta/Sandbox del producto.
- `STRIPE_LIVE_ROOM_PRODUCT_ID`: producto independiente del programa.
- `STRIPE_LIVE_ROOM_PRICE_ID`: precio mensual de respaldo si no hay precio predeterminado.
- `STRIPE_LIVE_ROOM_WEBHOOK_SECRET`: firma del endpoint de la sala.
- `LIVE_ROOM_RECONCILE_SECRET`: secreto aleatorio para la comprobación periódica de roles.
- `APP_URL`: origen HTTPS de producción. En desarrollo la sala utiliza localhost:3000.

No se utiliza la clave Stripe del programa como fallback. No utilizar variables NEXT_PUBLIC para secretos.

## Persistencia

Aplicar, previa revisión, `20261020020000_live_room_memberships.sql`.
No modifica purchases, enrollments, progreso ni mentorías. Las cuentas de prueba y Live
están separadas por `livemode`. Las escrituras y el lease son exclusivos de service_role.
Antes de Live, usar un servidor o rol distinto para pruebas y producción (configuración
DISCORD_GUILD_ID / DISCORD_MEMBER_ROLE_ID de cada entorno). Separar las filas Stripe
no separa los permisos de Discord si ambos entornos apuntan al mismo rol real.
El participante solo puede leer su propia cuenta; no escribe IDs ni estados de pago.
Los tipos TypeScript se alinearon localmente con la migración y deben regenerarse
contra el schema aplicado antes del checkpoint final.

La migración previa `20261020010000_remove_mentorship_practice_day_requirement.sql`
pertenece a otro cambio: revisar por separado, no ejecutar db push indiscriminado.

## Discord

OAuth2 utiliza `identify guilds.join`, state aleatorio con cookie HttpOnly, usuario
actual vinculado y expiración de 10 minutos. Los tokens OAuth no se guardan.
Redirecciones registradas:

- http://localhost:3000/api/discord/callback
- https://invictusgex.com/api/discord/callback

El bot debe tener Gestionar roles y estar por encima del rol de miembros.
La categoría privada deniega Ver canal a @everyone y permite acceso al rol de miembros.
Los canales deben estar sincronizados; revisar otras autorizaciones por rol/usuario.
Permitir Ver canal al bot facilita la comprobación del canal configurado; no necesita
Administrador, lectura de mensajes, intents privilegiados ni una conexión Gateway persistente.
Si hay requisitos de acceso del servidor, el usuario debe completarlos antes de pagar.
La identidad no se puede sustituir por otra desde el flujo normal.

## Stripe

Precio USD recurrente mensual, una unidad, sin prueba gratuita.
La sala utiliza Checkout estandar con `managed_payments.enabled=false` en cada
sesion, independientemente del valor predeterminado de la cuenta. No utiliza
Stripe como merchant of record; revisar las obligaciones fiscales antes de Live.
La web consulta el precio predeterminado del producto (caché pública: 60 segundos).
Para cambiar nuevas altas: crear precio y establecerlo como predeterminado en Stripe.
Los suscriptores existentes mantienen su tarifa; su migración requiere decisión explícita.
Una sesión abierta conserva su importe original hasta pagarse o expirar.
Si el precio no se puede verificar, se conserva la vista previa y no se ofrece iniciar pago.

Webhook independiente:

- Local: `/api/live-room/webhook`
- Producción: `https://invictusgex.com/api/live-room/webhook`

Eventos:

- checkout.session.completed
- checkout.session.async_payment_succeeded
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.paid
- invoice.payment_failed

Configurar Billing Customer Portal para actualizar medios de pago y cancelar al final
del periodo. No habilitar cambio arbitrario de productos/planes en el portal.
El acceso requiere subscription active, última factura paid y periodo vigente.
Past_due/unpaid/paused retiran el rol; no existe periodo de gracia en esta primera versión.
Una cancelación al final del periodo mantiene el acceso mientras siga pagado y activo.
Devoluciones/disputas requieren gestionar también la suscripción; no habilitar Live
sin definir y probar ese procedimiento operativo.

Para escuchar eventos de prueba con Stripe CLI autenticada en el mismo Sandbox:

```powershell
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid,invoice.payment_failed --forward-to localhost:3000/api/live-room/webhook
```

Guardar el whsec mostrado en STRIPE_LIVE_ROOM_WEBHOOK_SECRET local y reiniciar Next.
No reutilizar el whsec del webhook del programa ni el de CLI en producción.

## Reintentos y comprobación periódica

Los webhooks no dependen del orden de llegada: vuelven a consultar Stripe bajo un lease
de DB por usuario/entorno. PUT/DELETE del rol son idempotentes. Los fallos devuelven 500
a Stripe y permanecen pendientes en DB; no se confirman como procesados.

Configurar un scheduler externo cada 5 minutos que haga POST a `/api/live-room/reconcile`
con `Authorization: Bearer <LIVE_ROOM_RECONCILE_SECRET>`. No poner el secreto en la URL.
Revisa hasta 25 cuentas por ejecución, empezando por las menos recientes. Aumentar la
frecuencia/capacidad si crece el volumen. También existe comprobación manual en Admin.
El scheduler y la alerta ante errores repetidos son requisitos previos a Live.
El usuario puede volver a vincular la misma cuenta si salió del servidor.

### Configuracion del scheduler externo (cron-job.org)

Preparar la tarea desactivada hasta que la ruta este desplegada en produccion:

- Titulo: `Invictus GEX - sincronizar sala privada`.
- URL: `https://invictusgex.com/api/live-room/reconcile`.
- Frecuencia: cada 5 minutos.
- Metodo: `POST`.
- Cabecera: `Authorization`, valor `Bearer ` seguido del mismo secreto de
  `LIVE_ROOM_RECONCILE_SECRET` configurado en Hostinger (sin comillas).
- Cuerpo: vacio. Autenticacion Basic: desactivada.
- Avisos: fallo, recuperacion y desactivacion automatica.
- No guardar credenciales de Stripe, Discord ni Supabase en el scheduler.

Este proveedor almacenara el secreto de reconciliacion para poder llamar la ruta;
solo introducirlo directamente en su consola, nunca en Git ni en la URL.
No activar la tarea contra localhost ni contra un despliegue que aun no contiene
la sala. No esta configurada automaticamente por crear la variable en Hostinger.

Tras desplegar, ejecutar manualmente una vez y comprobar HTTP 200 con JSON
`checked` y `failed: 0`; despues habilitar el intervalo. HTTP 401 indica secreto
incorrecto, 404 ruta no publicada y 503 requiere revisar la sincronizacion.
Comprobar una segunda ejecucion programada en el historial. La ejecucion consulta
Stripe y puede asignar o retirar el rol segun la membresia real; no crea cobros.

## Pruebas antes de habilitar cobros

1. Ejecutar `node --env-file=.env.local scripts/check-live-room-config.mjs` (solo lectura).
2. Ejecutar `node scripts/test-live-room.mjs` (mocks offline; no sustituye prueba E2E).
3. Aplicar la migración revisada al entorno elegido y regenerar tipos.
4. Configurar firma del webhook y portal; reiniciar Next.
5. Oferta sin sesión; registro/login conserva el destino de la sala.
6. Vincular Discord real y comprobar identidad/servidor.
7. Pago con tarjeta de prueba: rol activado y canal accesible desde cuenta sin admin.
8. Repetir CTA: no duplicar suscripción; reanudar checkout abierto y reemplazar expirado.
9. Renovación, pago fallido, cancelación al fin del periodo y retirada efectiva del rol.
10. Simular fallo de Discord y verificar recuperación por webhook/reconciliación.
11. No suscriptor sin acceso a voz/texto; no usar una cuenta admin como prueba de aislamiento.
12. Comprobar que el checkout y webhook del programa siguen funcionando.

Sin estas comprobaciones reales no considerar terminada la puesta en producción.
