# Preapertura de la sala privada

- `/sala-en-vivo` muestra la presentacion publica sin exigir cuenta.
- La pantalla anterior se conserva en `PublicLiveRoomPage`; para reabrir,
  cambiar `liveRoomEnrollmentOpen` en `src/lib/services/live-room-enrollment.ts`
  tras confirmar la fecha y la disponibilidad de Stripe.
- Mientras esta cerrado, `startCheckout` rechaza nuevas compras tambien por API.
  Las cuentas con suscripcion existente conservan su panel, sincronizacion y portal.
- Correos normalizados y deduplicados en `public.live_room_waitlist`, con fecha
  y version del consentimiento. RLS activa: solo service_role puede leer/insertar.
- Administracion > Sala privada en vivo muestra los 50 ultimos y exporta todos
  mediante CSV protegido por autenticacion de administrador.
- No envia correos de apertura automaticamente, ni verifica propiedad del correo.
  Antes del lanzamiento, revisar/exportar la lista y preparar el aviso con opcion
  de baja. Las bajas solicitadas por correo requieren gestion administrativa.
- Limitacion antispam: honeypot y limite de cinco solicitudes por IP/hora en
  memoria por proceso, no es un limite distribuido ni sustituye CAPTCHA.
- Migracion: `20261031020000_live_room_waitlist.sql`.
- Pruebas: `node scripts/test-live-room-waitlist.mjs` y
  `node scripts/test-live-room.mjs`.
