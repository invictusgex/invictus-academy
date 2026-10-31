# Avisos de nuevas reservas

Las nuevas reservas realizadas por `/api/academy/mentorship-scheduling` notifican al operador despues de guardar la reserva y responder al alumno. La reserva no depende del resultado del correo. Un fallo al registrar el trabajo de fondo tampoco cambia la respuesta de reserva.

El destinatario es `MENTORSHIP_ALERT_EMAIL` cuando esta configurado; en caso contrario, se usa `LIVE_ROOM_ALERT_EMAIL`. No hace falta otra variable si los dos avisos van al mismo correo. Se reutilizan `EMAIL_PROVIDER`, `EMAIL_FROM` y `RESEND_API_KEY`. El dominio de envio debe estar verificado en Resend.

El aviso incluye fecha y hora en America/Chicago y el enlace privado `/admin/mentorship`. No transmite nombres, correos de alumnos, notas, identificadores ni enlace de reunion. El estado de la agenda puede cambiar despues de recibir el aviso: el panel es la referencia actual.

La cola `mentorship_email_deliveries` es privada, solo accesible al servidor, con deduplicacion persistente por reserva y un bloqueo temporal para envios simultaneos. Se usa tambien un hash como clave de idempotencia en Resend. La aceptacion del proveedor no prueba la llegada a bandeja; tampoco se garantiza exactly-once ante una interrupcion entre envio y registro del resultado, ya que la clave de Resend tiene una ventana limitada.

Si el envio falla, Agenda de mentorias muestra la razon segura y permite reintentar hasta tres pendientes por ejecucion. Si una reserva pendiente ya no esta confirmada, se omite el aviso. No hay un worker ni cron nuevo: los pendientes requieren reintento manual. Un fallo al guardar la cola inicial queda en los logs, sin afectar la reserva.

Solo se notifican nuevas reservas, no las antiguas ni cambios posteriores de horario. No se ha realizado ninguna reserva real para probar esta funcionalidad; las pruebas usan datos ficticios.
