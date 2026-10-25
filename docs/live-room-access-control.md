# Control de accesos de la sala

Ruta: `/admin/live-room`. Solo administradores.

## Revision manual

- Abrir Control de membresias y pulsar Actualizar revision.
- Cada pagina consulta hasta 25 cuentas en Stripe y el rol real en Discord; no usa `role_synced` como prueba del rol actual.
- Correcto: el derecho de pago y el rol coinciden.
- Retirar rol: Discord tiene el rol, pero Stripe no acredita acceso vigente.
- Falta asignar rol: Stripe acredita acceso, pero Discord no tiene el rol.
- Sin verificar: algun proveedor fallo; no interpretar como pago ni impago.
- Sincronizar vuelve a leer Stripe y aplica la misma regla de acceso usada por los webhooks. No cobra, cancela ni reembolsa.
- Los filtros se aplican a la pagina visible; revisar tambien las siguientes paginas.

## Cobertura

Se comprueba el rol de miembro de sala, no todos los permisos efectivos del canal. Administradores y excepciones de permisos de Discord requieren revision aparte.

El inventario adicional busca miembros con ese rol sin cuenta vinculada. Si Discord no permite listar miembros (403), se muestra cobertura no disponible; la comprobacion individual de cuentas vinculadas continua. No se amplia ningun permiso del bot automaticamente.

## Recordatorios independientes del cron

Cada suscripcion vigente verificada permite descargar un archivo de calendario con dos eventos: renovacion o fin de acceso y revision 24 horas despues. Importarlo en el calendario del operador y comprobar que sus notificaciones estan habilitadas. La compatibilidad de las alarmas depende del calendario.

Son recordatorios puntuales del periodo actual, no una suscripcion a un calendario que se actualice solo. Si cambia la fecha o se renueva el siguiente periodo, importar la nueva fecha. No confirman un impago: volver a consultar Stripe desde el panel antes de actuar.

## Correo administrativo

Configurar `LIVE_ROOM_ALERT_EMAIL` solo en el servidor, junto con `EMAIL_PROVIDER=resend`, `EMAIL_FROM` y `RESEND_API_KEY`. No publicar la direccion del operador ni claves en el repositorio. El interruptor de bienvenida no desactiva estos avisos operativos.

Agregar al webhook de la sala `invoice.upcoming` e `invoice.finalized`, ademas de los eventos existentes de pago fallido, pago confirmado y cambios/finalizacion de suscripcion. `invoice.upcoming` depende de los ajustes de facturacion de Stripe; no significa que el cobro haya ocurrido. Los eventos llegan cuando Stripe los genera, no a una hora fija del calendario.

Los correos contienen solo el tipo de alerta, la fecha y el enlace al panel privado. No contienen nombres ni identificadores de clientes, perfiles o suscripciones. La cola privada guarda solo un hash de deduplicacion, tipo, fecha y estado del envio. RLS y privilegios impiden el acceso desde anon/authenticated.

El procesamiento del correo ocurre despues de responder al webhook. Un error de correo o de su cola no cambia el resultado de la sincronizacion ni la respuesta de facturacion. Los pendientes se reintentan con los siguientes eventos o con el boton administrativo; no hay un worker permanente ni una garantia de entrega. Si falla incluso el registro inicial del aviso, se deja un error seguro en los logs. La aceptacion por Resend no demuestra llegada a la bandeja del destinatario.

Los envios tienen bloqueo de concurrencia y deduplicacion por evento en base de datos, mas Idempotency-Key de Resend. La ventana del proveedor es limitada; no se promete exactly-once ante una interrupcion entre envio y confirmacion en la base de datos. Los correos no bloquean pagos ni retiran roles.

Actualizar revision genera avisos agregados de discrepancias o verificaciones fallidas, como maximo uno de cada tipo por hora. Esto revisa la pagina seleccionada, no todo el servidor. No existe correo programado automaticamente para el dia siguiente: para eso se mantienen los recordatorios de calendario del periodo actual.
