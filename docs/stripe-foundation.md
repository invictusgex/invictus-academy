# Stripe Foundation

FASE 8.1 - Infraestructura base. Fase 8.2 instala el SDK oficial y prepara la instancia server-side. No implementa Checkout, Webhooks, enrollments automaticos, cupones, Session 101 ni portal de clientes.

## 1. Arquitectura propuesta

La arquitectura queda separada en una carpeta dedicada:

```text
src/lib/stripe/
  stripe-config.ts
  stripe-errors.ts
  stripe-server.ts
  stripe-types.ts
```

Se eligio `src/lib/stripe` porque Stripe es un proveedor externo con configuracion, errores y tipos propios. Mantenerlo fuera de `services` y `repositories` evita mezclar infraestructura de pago con dominio academico o acceso.

## 2. Responsabilidad de cada archivo

`stripe-config.ts`

- centraliza nombres de variables de entorno;
- valida variables requeridas;
- expone configuracion server/client separada;
- separa configuracion de Checkout y Webhooks para no exigir secretos fuera de fase.

`stripe-server.ts`

- sera el unico punto para obtener la instancia server-side de Stripe;
- valida configuracion antes de habilitar integraciones;
- reutiliza una unica instancia del SDK oficial `stripe`;
- no debe importarse desde Client Components.

`stripe-types.ts`

- define tipos propios del dominio Stripe;
- evita usar `any`;
- separa configuracion publica y secreta.

`stripe-errors.ts`

- centraliza errores de configuracion y disponibilidad;
- permite que fases futuras capturen errores esperados sin exponer secretos.

## 3. Variables de entorno

Variables requeridas:

```text
STRIPE_SECRET_KEY=
STRIPE_MENTORSHIP_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
APP_URL=
```

Reglas:

- `STRIPE_SECRET_KEY` solo servidor.
- `STRIPE_MENTORSHIP_PRICE_ID` solo servidor.
- `STRIPE_WEBHOOK_SECRET` solo servidor.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` puede exponerse al cliente cuando se implemente Stripe.js.
- `APP_URL` se usa para construir redirecciones server-side confiables.
- Ninguna secret key debe usar prefijo `NEXT_PUBLIC`.
- No se colocan valores reales en `.env.example`.

## 4. Instalacion del SDK

Fase 8.2 instalo el SDK oficial:

```text
stripe@22.3.2
```

La instancia se obtiene desde `getStripeServer()` y vive exclusivamente en
`src/lib/stripe/stripe-server.ts`. No se fija `apiVersion` manualmente.

## 5. Flujo previsto

Flujo futuro de Checkout:

```text
Client action
  -> server route/action
  -> getStripeServer()
  -> validar producto y price interno
  -> crear Checkout Session
  -> redirigir al usuario
```

Flujo futuro de Webhook:

```text
Stripe event
  -> route handler server-side
  -> verificar firma con STRIPE_WEBHOOK_SECRET
  -> registrar purchase_event
  -> actualizar purchase
  -> activar o ajustar enrollment segun evento confiable
```

La redireccion del navegador no concede acceso. La fuente de verdad para activar enrollments sera el webhook verificado.

## 6. Fase 8.2 - Checkout Session

La Fase 8.2B implementa la Route Handler server-side:

```text
POST /api/stripe/checkout
```

No crea Webhooks, purchases, purchase_events, enrollments por pago, Session 101,
cupones ni portal de clientes.

La ruta consume la base creada en Fase 8.2A:

- `src/lib/supabase/server.ts` crea un cliente Supabase por request.
- `src/proxy.ts` mantiene cookies de Supabase sin proteger rutas ni redirigir.
- `src/lib/auth/server.ts` expone `requireServerAuthContext()`.
- `src/lib/auth/server-errors.ts` define errores tipados.

Contrato de entrada:

Entrada permitida:

```json
{
  "productSlug": "trading-basado-en-datos"
}
```

Salida exitosa:

```json
{
  "url": "https://checkout.stripe.com/..."
}
```

Error controlado:

```json
{
  "error": {
    "code": "ALREADY_ENROLLED",
    "message": "Ya tienes acceso activo a este programa."
  }
}
```

El servidor decidira:

- `STRIPE_MENTORSHIP_PRICE_ID`;
- `mode: payment`;
- `quantity: 1`;
- `success_url` desde `APP_URL` + `/oferta/exito?session_id={CHECKOUT_SESSION_ID}`;
- `cancel_url` desde `APP_URL` + `/oferta/cancelado`;
- metadata minima para conciliacion futura;
- `customer_email` desde el usuario/perfil autenticado cuando exista.

Metadata de Session y PaymentIntent:

- `profile_id`;
- `product_slug`;
- `internal_product_id`;
- `environment`.

Validaciones:

- `Content-Type: application/json`;
- JSON valido;
- cuerpo con unicamente `productSlug`;
- slug dentro del catalogo comercial permitido;
- usuario autenticado con `supabase.auth.getUser()`;
- profile resuelto desde el usuario validado;
- producto interno existente;
- `products.status = 'active'`;
- ausencia de enrollment con `status = 'active'`.

Comportamiento de enrollment:

- `active`: bloquea Checkout con `ALREADY_ENROLLED`;
- `revoked`: permite iniciar un nuevo Checkout;
- `expired`: permite iniciar un nuevo Checkout.

Checkout no concedera acceso, no creara enrollments, no actualizara purchases y
no registrara pagos como completados. La activacion futura dependera de Webhooks
verificados.

Codigos de error:

- `INVALID_CHECKOUT_REQUEST`
- `UNAUTHENTICATED`
- `PROFILE_NOT_FOUND`
- `PRODUCT_NOT_FOUND`
- `PRODUCT_NOT_PURCHASABLE`
- `ALREADY_ENROLLED`
- `STRIPE_NOT_CONFIGURED`
- `CHECKOUT_CREATION_FAILED`

## 7. Que implementara una fase posterior

Una fase posterior debera completar la base comercial antes de activar pagos:

- esquema de `commercial_prices`;
- esquema de `stripe_customers`;
- esquema de `purchases`;
- esquema de `purchase_events`;
- contratos de repository/service;
- validacion server-side de producto y price;
- decision sobre compra duplicada.

## 8. Preparacion para Fase 8.3

Fase 8.3 debera implementar Webhooks verificados solo despues de contar con
Checkout seguro:

- verificar firma con `STRIPE_WEBHOOK_SECRET`;
- no confiar en redirects de navegador;
- registrar eventos de Stripe de forma idempotente;
- actualizar purchases cuando exista el esquema correspondiente;
- activar enrollments solamente desde eventos verificados.

## 8.4 Stripe Webhook Engine

Fase 8.4 agrega:

- `POST /api/stripe/webhook`;
- verificacion de firma con raw body;
- `StripeWebhookService`;
- procesamiento idempotente por `stripe_event_id`;
- escritura server-side mediante cliente administrativo exclusivo de servidor;
- operaciones de dominio en `PurchaseService`.

Eventos soportados inicialmente:

- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

La ruta no crea purchases, no crea enrollments y no concede acceso. Si un evento
no encuentra una compra interna existente, se registra como anomalia controlada
`PURCHASE_NOT_FOUND`.

La escritura del Webhook usa `SUPABASE_SERVICE_ROLE_KEY` solo en servidor. Esta
variable no debe exponerse con prefijo `NEXT_PUBLIC`.

## 8.4A Purchase Lifecycle Integration

Fase 8.4A corrige la inconsistencia critica entre Checkout y Webhooks:

```text
Checkout request autenticado
  -> valida producto y enrollment
  -> lee Stripe Price server-side
  -> crea Purchase pending
  -> crea purchase_created
  -> crea Stripe Checkout Session
  -> asocia provider_checkout_session_id
  -> crea payment_pending
  -> devuelve URL
```

La `Purchase` nace antes de devolver una URL de Stripe. Si falla la persistencia
comercial, no se crea una sesion usable. Si Stripe crea una sesion pero luego
falla la asociacion local o el evento secundario, el servidor intenta cancelar la
compra interna, expirar la sesion de Stripe y no devuelve URL.

El importe y la moneda se obtienen desde `STRIPE_MENTORSHIP_PRICE_ID` usando el
SDK server-side de Stripe. No se aceptan `amount`, `currency`, `priceId`,
`customerId` ni `profileId` desde el navegador.

Metadata final de Session y PaymentIntent:

- `purchase_id`
- `purchase_number`
- `profile_id`
- `product_slug`
- `internal_product_id`
- `environment`

`client_reference_id` usa `purchase.id` para que Stripe apunte a la compra
interna y no solamente al perfil.

La key idempotente de Stripe para crear Checkout Session es:

```text
checkout-session:{purchase.id}
```

No se recibe desde el navegador y no se reutiliza entre compras distintas.

## 9. Riesgos

- Checkout requiere un patron server-side confiable de Supabase Auth antes de crear la Route Handler.
- Si se importa `stripe-server.ts` desde cliente en una fase futura, se podria exponer arquitectura server-side al bundle. Debe mantenerse solo en rutas server/actions.
- La publishable key es publica por diseno, pero no debe usarse para confiar precio o acceso.
- Sin webhook verificado, ningun pago debe conceder enrollment.

## 10. Checklist previo a produccion

- Mantener SDK oficial `stripe`.
- Definir autenticacion server-side segura para Route Handlers.
- Configurar `STRIPE_SECRET_KEY` solo en entorno servidor.
- Configurar `STRIPE_MENTORSHIP_PRICE_ID` solo en entorno servidor.
- Configurar `APP_URL` desde entorno servidor.
- Configurar `STRIPE_WEBHOOK_SECRET` solo en entorno servidor.
- Configurar `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` solo con publishable key.
- Verificar firma de webhooks.
- Hacer idempotentes todos los eventos por `stripe_event_id`.
- Validar price/product en servidor.
- No confiar montos enviados desde navegador.
- Confirmar RLS de purchases, purchase_events y enrollments.
- Probar pago exitoso, pago fallido, webhook duplicado, reembolso y disputa.

## 11. Fase 9.6 - Payment Lifecycle Hardening

Variables requeridas para entorno de pruebas o produccion:

```text
STRIPE_SECRET_KEY=
STRIPE_MENTORSHIP_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
APP_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Reglas de entorno:

- Las claves secretas de Stripe y Supabase viven solo en servidor.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` es la unica variable publica de Stripe.
- Test y Live se separan con variables de entorno, sin hardcodes en codigo.
- No se activan claves Live hasta completar pruebas operativas del webhook.

Eventos de Webhook procesados:

- `checkout.session.completed`: asocia `payment_intent` si Stripe lo devuelve.
- `payment_intent.succeeded`: confirma la compra y ejecuta fulfillment actual.
- `payment_intent.payment_failed`: marca la compra como fallida si aun no fue pagada.
- `charge.refunded`: actualiza `amount_refunded_minor`; el refund total revoca solo el enrollment concedido por esa Purchase.
- `charge.dispute.created`: marca la compra como disputada y suspende el enrollment concedido por esa Purchase.
- `charge.dispute.closed`: si Stripe marca la disputa como `won`, restaura acceso solo cuando la revocacion previa fue causada por disputa y no existe refund total; si no, mantiene el acceso revocado.

Politica comercial:

- Pago confirmado: mantiene `fulfill_paid_purchase`.
- Reembolso parcial: registra `partially_refunded` sin revocar automaticamente.
- Reembolso total: registra `refunded` y revoca con `revocation_source = 'stripe_refund'`.
- Disputa abierta: registra `disputed` y revoca con `revocation_source = 'stripe_dispute'`.
- Disputa ganada: vuelve la Purchase a `paid` cuando corresponde y restaura solo enrollments revocados por disputa.
- Disputa perdida: conserva la Purchase disputada y el enrollment revocado.
- Nunca se modifica un enrollment distinto al enlazado en `purchases.enrollment_id`.

Decisiones de seguridad:

- La firma del webhook se verifica con raw body y `STRIPE_WEBHOOK_SECRET`.
- No se confia en montos, moneda, price IDs, customer IDs ni profile IDs enviados desde navegador.
- Los cambios de enrollment por ciclo comercial viven en RPCs `security definer` ejecutables solo por `service_role`.
- Las RPCs bloquean Purchase y Enrollment con `for update` para evitar carreras y mantener idempotencia.
- `enrollments.revocation_source` permite distinguir revocaciones manuales de revocaciones por Stripe.

Pasos futuros para Stripe Live:

1. Crear productos y prices Live en Stripe.
2. Configurar variables Live en el entorno de hosting, nunca en archivos versionados.
3. Registrar el endpoint de webhook Live con los eventos soportados.
4. Ejecutar pruebas de pago, refund, disputa y retry antes de abrir ventas.
