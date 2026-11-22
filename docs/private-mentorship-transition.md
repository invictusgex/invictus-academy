# Mentoria privada - cambio de oferta

La oferta publica y el espacio del alumno ahora describen una mentoria privada
individual por 349 USD, pago unico, sin descuentos, videos grabados, modulos ni
requisitos academicos previos. No hay un numero fijo de sesiones: profesor y alumno
acuerdan fechas, duracion y contenido. Se conserva el slug interno del producto
para no romper pagos, reembolsos, cuentas ni acceso existente.

## Reservas

- Solo una reserva confirmada por inscripcion a la vez; no hay un maximo de sesiones.
- Una sesion completada no cierra el acompanamiento. Se puede reservar otra.
- Se mantienen los bloqueos de disponibilidad, el bloqueo del mismo dia en Chicago,
  la autenticacion, la inscripcion activa y los avisos de nuevas reservas.
- El RPC comprueba identidad, producto y acceso antes de usar permisos elevados.
- El alumno puede cancelar su reserva confirmada, nunca la de otra cuenta.
- El administrador cierra o reabre el acompanamiento desde Agenda de mentorias.
  No se puede cerrar mientras haya una reserva confirmada. El historial sigue visible.

## Contenido y datos

Las rutas antiguas de videos, programa, escenarios y sesion unica redirigen al
espacio de mentoria. Los modulos se despublicaron sin borrar medios, progreso o
historial. La administracion deja de mostrar gestion de videos y promociones.
No se han borrado alumnos, compras, reembolsos ni sesiones existentes.

La auditoria previa encontro cuatro accesos activos y cuatro compras marcadas como
pagadas. Una de ellas fue declarada reembolsada por el propietario, pero la base
local del proyecto aun no tenia ese reembolso. No se alteraron estados financieros
sin una comprobacion del proveedor.

## Checkout

- Exige un precio de pago unico, activo, en USD y por 34900 centavos.
- No acepta codigos promocionales. La API no acepta importes ni cupones del cliente.
- Las sesiones pendientes antiguas con promociones se expiran al recuperarlas.
- Una sesion ya pagada lleva a la confirmacion, sin crear otro intento de cobro.
- El nombre externo del producto en Stripe requiere actualizarse en modo real:
  Mentoria privada Invictus GEX. No se cambiaron claves ni precios de produccion.
- No se desactivaron globalmente cupones de Stripe que pudieran usarse en otros
  productos. La nueva oferta no los admite.

## Verificacion

- `node scripts/test-private-mentorship.mjs`: precio, descuentos, sesion anterior y
  proteccion frente a cobro duplicado.
- Pruebas existentes de agenda, antelacion, correo, Discord y destino de acceso.
- Prueba SQL transaccional: reserva sin modulos, segunda sesion tras completar,
  idempotencia, alumno sin acceso, cancelacion ajena y cierre solo administrativo.
  Todas las reservas ficticias y cambios de prueba se revirtieron a un savepoint.
- Playwright en 1440x1000 y 390x844 con reservas simuladas, sin guardar datos.
- Migracion aplicada: `20261122010000_private_mentorship_product.sql`.

Pendiente de comprobacion fisica: compra nueva en modo real, nueva reserva desde
cuenta de alumno, entrega de ambos avisos y revision del reembolso en Stripe.
