# Avisos de nuevas reservas

Las nuevas reservas realizadas por `/api/academy/mentorship-scheduling` notifican al operador despues de guardar la reserva y responder al alumno. La reserva no depende del resultado del correo. Un fallo al registrar el trabajo de fondo tampoco cambia la respuesta de reserva.

El destinatario es `MENTORSHIP_ALERT_EMAIL` cuando esta configurado; en caso contrario, se usa `LIVE_ROOM_ALERT_EMAIL`. No hace falta otra variable si los dos avisos van al mismo correo. Se reutilizan `EMAIL_PROVIDER`, `EMAIL_FROM` y `RESEND_API_KEY`. El dominio de envio debe estar verificado en Resend.

El aviso incluye nombre y correo del alumno, estado confirmado, fecha, inicio y fin en America/Chicago, duracion, zona del horario, hora local y zona del alumno, fecha de reserva y hasta 400 caracteres de la nota del alumno. Incluye el enlace privado `/admin/mentorship` para consultar detalles completos. No incluye notas internas del mentor ni datos bancarios. El panel es la referencia si la reserva cambia.

La cola `mentorship_email_deliveries` es privada, solo accesible al servidor, con deduplicacion persistente por reserva y un bloqueo temporal para envios simultaneos. Se usa tambien un hash como clave de idempotencia en Resend. La aceptacion del proveedor no prueba la llegada a bandeja; tampoco se garantiza exactly-once ante una interrupcion entre envio y registro del resultado, ya que la clave de Resend tiene una ventana limitada.

Si el envio falla, Agenda de mentorias muestra la razon segura y permite reintentar hasta tres pendientes por ejecucion. Si una reserva pendiente ya no esta confirmada, se omite el aviso. No hay un worker ni cron nuevo: los pendientes requieren reintento manual. Un fallo al guardar la cola inicial queda en los logs, sin afectar la reserva.

Solo se notifican nuevas reservas, no las antiguas ni cambios posteriores de horario. No se ha realizado ninguna reserva real para probar esta funcionalidad; las pruebas usan datos ficticios.

## Discord privado

Se utiliza el bot existente y `MENTORSHIP_DISCORD_ALERT_USER_ID`, o como alternativa
`ACADEMY_DISCORD_ALERT_USER_ID`. No hay que configurar otra variable si el destino
es el mismo de los avisos de compras. Se valida el destinatario del DM antes de
enviar; no se publica en canales del servidor. Las menciones estan desactivadas.

`mentorship_discord_deliveries` mantiene una cola privada e independiente del correo.
La migracion `20261119010000_mentorship_discord_deliveries.sql` solo crea esa cola.
La deduplicacion persistente es por reserva y hay un bloqueo temporal. Discord
tambien recibe un nonce estable, pero su ventana de deduplicacion es de minutos:
una interrupcion entre envio y guardado puede producir un duplicado posterior.
No hay garantia de entrega exactamente una vez ni cron nuevo. Los reintentos son
manuales desde Agenda de mentorias. Un fallo al registrar la cola inicial solo
se registra en logs, sin afectar la reserva.

El boton 'Probar Discord y correo' utiliza datos ficticios y no reserva horarios.
Un resultado aceptado por el proveedor no confirma lectura ni llegada a bandeja.

Pruebas: `node scripts/test-mentorship-email.mjs` y
`node scripts/test-mentorship-discord.mjs`.

## Antelacion de la reserva

No se pueden confirmar nuevas reservas para el mismo dia en America/Chicago.
El primer horario reservable es el dia siguiente del calendario del mentor,
no necesariamente 24 horas despues. La zona del alumno no cambia esta regla.
La lista publica filtra esos horarios, el servicio valida solicitudes antiguas
y un trigger privado protege tambien el RPC y las inserciones directas.
No se cancelan ni modifican reservas confirmadas previamente; completar o cancelar
una reserva existente sigue permitido. Reactivar o cambiar de horario una reserva
confirmada exige de nuevo una fecha desde el dia siguiente.
Migracion: `20261119020000_mentorship_next_day_booking.sql`.
Prueba: `node scripts/test-mentorship-booking-window.mjs`.
