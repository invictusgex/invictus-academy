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

No hay correos programados ni otro scheduler nuevo. El destinatario y el canal de avisos deben confirmarse antes de implementar notificaciones externas.
