# Commercial Domain Design

FASE 8.0 - Documento de analisis. No implementa Stripe, no crea migraciones y no modifica el flujo actual.

## 1. Resumen ejecutivo

El dominio comercial debe girar alrededor de un unico producto inicial: **Invictus Trading Academy - Mentoria Grabada**. La compra concede acceso al programa privado mediante un enrollment activo. El contenido academico, el progreso y los requisitos de Session 101 siguen siendo dominios separados.

Recomendacion tecnica inicial:

- pago unico;
- moneda inicial USD;
- cuenta obligatoria antes del pago;
- acceso sin expiracion por defecto mientras la cuenta y el enrollment sean validos;
- Stripe como fuente de verdad de cobros, refunds, disputes, cupones y payment objects;
- Supabase como fuente de verdad de usuario, perfil, producto interno, compra interna, enrollment, progreso, requisitos de Session 101 y auditoria administrativa;
- acceso concedido solo por webhook verificado, nunca por redireccion del navegador.

Estas son recomendaciones tecnicas para simplificar lanzamiento y trazabilidad. El precio, politica de reembolso, impuestos y reglas comerciales finales siguen pendientes de decision del dueno del proyecto.

## 2. Producto inicial

Producto comercial provisional:

```text
Invictus Trading Academy - Mentoria Grabada
```

Incluye:

- acceso al programa privado;
- modulos de formacion;
- videos;
- recursos descargables;
- configuracion de Quantower;
- configuracion de GEXBot;
- configuracion de Heatmap;
- seguimiento de progreso;
- camino guiado hacia Session 101;
- Session 101 incluida como beneficio bloqueado hasta cumplir requisitos.

No incluye por ahora:

- semana de acompanamiento;
- productos adicionales;
- suscripcion recurrente;
- afiliados completos;
- calendario propio;
- reserva automatizada implementada dentro de la plataforma.

Decisiones propuestas:

- Pago: unico, no suscripcion.
- Moneda inicial: USD.
- Acceso: sin fecha de expiracion por defecto.
- Precio: configuracion comercial en Stripe y referencia interna en Supabase; no hardcodeado en componentes.
- Cambios futuros de precio: crear nuevas versiones de precio o `price_id`; no editar historicos de compras.
- Relacion academica: el producto comercial se vincula con `products.slug = trading-basado-en-datos`; el contenido se sigue leyendo por producto academico.

## 3. Identidades y entidades

No deben confundirse estos conceptos:

| Concepto | Significado | Fuente de verdad |
| --- | --- | --- |
| Usuario de Auth | Identidad autenticada para iniciar sesion | Supabase Auth |
| Perfil | Datos internos del usuario | `public.profiles` |
| Cliente de Stripe | Identidad comercial en Stripe | Stripe, referenciada en Supabase |
| Comprador | Persona que paga | Stripe checkout/payment data |
| Estudiante | Usuario con acceso academico | Supabase, por enrollment |
| Enrollment | Permiso de acceso a un producto | `public.enrollments` |
| Administrador | Usuario autorizado para operar admin | `public.admin_users` |

Una misma persona puede ser comprador, usuario, estudiante y cliente de Stripe, pero el sistema debe tratarlos como entidades conectadas, no identicas.

## 4. Estados comerciales

Estados propuestos para `purchases`:

| Estado | Significado | Actualiza | Concede acceso | Revoca acceso |
| --- | --- | --- | --- | --- |
| `pending` | Checkout iniciado o pago aun no confirmado | App/webhook | No | No |
| `paid` | Pago confirmado y capturado | Webhook Stripe | Si | No |
| `failed` | Pago fallido | Webhook Stripe | No | No |
| `canceled` | Checkout o intento cancelado | Webhook/App | No | No |
| `refunded` | Reembolso total | Webhook Stripe | No | Si, salvo excepcion admin |
| `partially_refunded` | Reembolso parcial | Webhook Stripe | Depende de politica | Requiere decision |
| `disputed` | Disputa/contracargo abierto | Webhook Stripe | Requiere politica | Recomendado suspender/revocar temporalmente |

La compra no es lo mismo que el pago. Una compra interna puede tener varios eventos comerciales asociados: checkout, payment intent, refund, dispute o actualizaciones repetidas.

## 5. Estados de enrollment

Estados actuales del proyecto:

- `active`;
- `revoked`;
- `expired`.

Recomendacion para el producto inicial: conservar estos estados. No agregar `pending`, `suspended` ni `completed` en `enrollments` todavia.

Razon:

- `pending` pertenece a la compra, no al enrollment.
- `suspended` podria necesitarse para disputes, pero puede modelarse inicialmente como `revoked` con auditoria y source/action.
- `completed` pertenece al progreso o journey, no al acceso.
- `expired` ya cubre acceso temporal futuro.

Diferencias:

- Estado del pago: estado puntual de Stripe.
- Estado de compra: resumen interno del ciclo comercial.
- Estado de enrollment: si el usuario puede acceder al producto.
- Estado de progreso: avance academico por modulo.

## 6. Reglas de acceso

Flujo recomendado:

1. Usuario autenticado inicia checkout.
2. Servidor valida producto y precio.
3. Stripe procesa el pago.
4. Stripe envia webhook firmado.
5. El webhook se verifica en servidor.
6. Se registra o actualiza la compra.
7. Se crea o reactiva enrollment `active` con `access_source = purchase`.
8. El alumno obtiene acceso.

Reglas:

- La redireccion post-checkout nunca concede acceso.
- Solo un webhook verificado puede convertir una compra en acceso automatico.
- El monto, producto y precio no se aceptan desde el navegador.
- El usuario debe quedar enlazado antes de crear checkout.
- Compra repetida del mismo producto no debe crear enrollment duplicado.
- Webhook duplicado debe ser idempotente.
- Webhook retrasado debe poder activar acceso aunque el navegador ya se haya cerrado.
- Pago exitoso sin usuario enlazado queda en estado de revision operativa.
- Email de compra distinto al email de cuenta requiere conciliacion administrativa o reglas explicitas.
- Acceso manual por admin no requiere compra ficticia.

## 7. Modelo recomendado de registro y compra

Modelos evaluados:

| Modelo | Ventajas | Riesgos |
| --- | --- | --- |
| Cuenta antes de pagar | Trazabilidad simple, menor riesgo de compras huerfanas, enrollment directo | Un paso mas antes de checkout |
| Pago antes de cuenta | Menos friccion inicial | Conciliacion dificil, soporte alto, riesgo de acceso no enlazado |

Recomendacion para lanzamiento: **cuenta antes de pagar**.

Motivo: el producto inicial es una mentoria estructurada con acceso privado y Session 101. La prioridad debe ser trazabilidad, soporte simple y seguridad del enrollment.

## 8. Session 101

Session 101 debe tratarse como beneficio incluido en la compra inicial, no como producto separado en el lanzamiento.

Reglas propuestas:

- Costo: incluido en la mentoria grabada.
- Entitlement separado: no necesario para lanzamiento; puede derivarse de purchase + enrollment + requisitos completados.
- Desbloqueo: automatico cuando se cumplan requisitos del journey.
- Requisitos:
  - 100% de modulos completados;
  - formularios por modulo completos;
  - cinco dias de trading registrados;
  - formulario final completo.
- Reserva: una sola reserva activa por alumno.
- Reprogramacion: decision comercial pendiente; tecnicamente debe registrarse como evento.
- Ausencia: decision comercial pendiente; tecnicamente debe permitir marcar `no_show`.
- Reembolso: si hay reembolso total antes de realizar Session 101, debe bloquearse. Si ya fue usada, requiere politica comercial.

No se debe llamar clase privada. El nombre oficial es **Session 101**.

## 9. Cupones y descuentos

Alcance inicial recomendado:

- usar cupones y promotion codes de Stripe;
- permitir descuento porcentual o fijo solo si Stripe lo valida;
- fecha de expiracion y limite de usos controlados por Stripe;
- Supabase guarda referencias y resumen aplicado en la compra, no la logica completa del descuento.

Posponer:

- sistema de afiliados;
- comisiones;
- descuento GEXBot automatizado;
- campañas complejas multi-producto.

Datos a copiar a Supabase:

- `stripe_coupon_id`;
- `stripe_promotion_code_id`;
- codigo visible usado, si aplica;
- monto descontado;
- moneda;
- snapshot del total pagado.

## 10. Reembolsos y disputas

Reglas tecnicas propuestas:

| Evento | Compra | Enrollment |
| --- | --- | --- |
| Reembolso total | `refunded` | revocar acceso, salvo override admin |
| Reembolso parcial | `partially_refunded` | mantener o revisar segun politica |
| Disputa abierta | `disputed` | recomendar suspension/revocacion temporal |
| Disputa perdida | `refunded` o estado equivalente | revocar acceso |
| Disputa ganada | volver a `paid` si aplica | reactivar si estaba suspendido/revocado por disputa |
| Cancelacion manual antes de pago | `canceled` | no crear acceso |

Casos que requieren decision comercial:

- si existe reembolso despues de consumir gran parte del curso;
- si Session 101 ya fue realizada;
- si reembolso parcial conserva acceso;
- si un admin puede reactivar acceso despues de disputa.

## 11. Acceso manual

El panel actual ya permite gestionar enrollments. Debe coexistir con Stripe asi:

- Acceso comprado: `access_source = purchase`, vinculado a compra interna.
- Acceso manual: `access_source = manual`, sin compra ficticia.
- Acceso promocional: `access_source = promotion`, con motivo/campaña futura.
- Acceso de prueba: puede ser `promotion` con `expires_at`.
- Acceso administrativo: permiso admin no equivale a enrollment academico.

Reglas:

- Una compra de Stripe no debe perderse aunque un admin modifique el enrollment.
- Un enrollment manual no requiere purchase.
- Las acciones admin futuras deben tener auditoria: admin, accion, motivo, fecha, estado anterior y nuevo estado.

## 12. Fuentes de verdad

| Dato | Fuente de verdad | Supabase guarda |
| --- | --- | --- |
| Cobro | Stripe | IDs y snapshot |
| Payment intent | Stripe | `provider_payment_intent_id` |
| Checkout session | Stripe | `provider_checkout_session_id` |
| Customer | Stripe | referencia vinculada al perfil |
| Refund | Stripe | evento y resumen |
| Dispute | Stripe | evento y estado sincronizado |
| Coupon/promotion code | Stripe | referencias y snapshot |
| Usuario | Supabase Auth | perfil enlazado |
| Perfil | Supabase | datos internos |
| Producto interno | Supabase `products` | slug academico |
| Compra interna | Supabase futuro `purchases` | estado comercial normalizado |
| Enrollment | Supabase `enrollments` | acceso |
| Progreso | Supabase `module_progress` | avance modular |
| Requisitos Session 101 | Supabase futuro journey | elegibilidad |
| Auditoria admin | Supabase futuro audit log | acciones internas |

## 13. Idempotencia

Identificadores unicos recomendados:

- `stripe_event_id` unico en `purchase_events`;
- `provider_checkout_session_id` unico por `payment_provider` en `purchases`;
- `provider_payment_intent_id` unico por `payment_provider` cuando exista;
- `(profile_id, product_id)` unico en `enrollments` ya existe;
- `purchase_id + event_type` para eventos internos derivados, si aplica.

Reglas:

- Webhook repetido no crea compra duplicada.
- Webhook repetido no crea enrollment duplicado.
- Reembolso repetido actualiza el mismo purchase.
- Checkout repetido para producto ya comprado debe reutilizar o bloquear segun decision comercial.
- Doble clic en checkout debe crear a lo sumo una session activa por usuario/producto cuando sea posible.
- Reintentos de Stripe se procesan como upserts idempotentes.

## 14. Seguridad

Reglas base:

- Stripe secret key solo en servidor.
- Webhook secret solo en servidor.
- Ninguna secret key con `NEXT_PUBLIC`.
- El cliente no decide precio, monto ni moneda.
- `product_id` y `price_id` deben validarse en servidor.
- El webhook debe verificar firma.
- Acceso concedido solo tras evento confiable.
- Operaciones admin protegidas por `RequireAdmin` y RLS.
- `service_role` solo puede usarse en servidor y nunca en componentes.
- Supabase RLS sigue siendo la barrera real de datos privados.

## 15. Modelo conceptual minimo

Entidades recomendadas para lanzamiento:

| Entidad | Proposito | Necesaria |
| --- | --- | --- |
| `products` | Producto interno academico ya existente | Si, existente |
| `commercial_prices` | Mapeo interno de precio activo a Stripe price | Si |
| `stripe_customers` | Vincular perfil con customer de Stripe | Si |
| `purchases` | Estado interno de compra por usuario/producto | Si |
| `purchase_events` | Idempotencia y auditoria de webhooks | Si |
| `enrollments` | Acceso efectivo al programa | Si, existente |
| `admin_access_actions` | Auditoria de cambios manuales | Recomendado, puede posponerse si se documenta operacion |

Posponer:

- `commercial_products`: usar `products` al inicio si solo hay un producto.
- `entitlements`: no necesario mientras solo exista acceso al programa y Session 101 incluida.
- `enrollment_sources`: puede resolverse inicialmente con `access_source`.
- `session_101_eligibility`: necesario cuando se implemente journey/formularios, no para Stripe inicial.

## 16. Flujos

### A. Registro -> checkout -> pago -> acceso

```text
Usuario crea cuenta
  -> servidor crea checkout con price permitido
  -> Stripe confirma pago
  -> webhook verificado
  -> upsert purchase paid
  -> upsert enrollment active purchase
  -> alumno entra a /academy
```

### B. Pago fallido

```text
Checkout iniciado
  -> pago falla
  -> webhook registra purchase failed
  -> no se crea enrollment
  -> usuario puede reintentar
```

### C. Webhook duplicado

```text
Stripe reintenta evento
  -> sistema detecta stripe_event_id existente
  -> no duplica purchase
  -> no duplica enrollment
  -> responde OK
```

### D. Compra repetida

```text
Usuario con enrollment activo intenta comprar
  -> servidor detecta acceso existente
  -> decision pendiente: bloquear checkout o permitir compra adicional
```

Recomendacion: bloquear compra duplicada del mismo producto en lanzamiento.

### E. Reembolso total

```text
Stripe emite refund total
  -> webhook verificado
  -> purchase refunded
  -> enrollment revoked
  -> Session 101 bloqueada si no fue realizada
```

### F. Acceso manual otorgado por admin

```text
Admin concede acceso
  -> se crea/reactiva enrollment manual
  -> no se crea purchase ficticia
  -> se registra accion administrativa futura
```

### G. Alumno completa requisitos y desbloquea Session 101

```text
Enrollment activo
  -> 100% modulos
  -> formularios completos
  -> cinco dias practica
  -> formulario final
  -> Session 101 disponible
```

### H. Pago exitoso pero enrollment no pudo crearse

```text
Webhook confirma pago
  -> purchase paid guardada
  -> falla upsert enrollment
  -> registrar evento de error operativo
  -> mantener compra paid
  -> cola/reintento o revision admin
```

## 17. Decisiones abiertas

Decisiones comerciales pendientes:

- precio inicial;
- moneda definitiva;
- acceso vitalicio o temporal;
- pago unico o suscripcion;
- politica de reembolso;
- cuenta obligatoria antes de pagar;
- si se bloquean compras duplicadas;
- transferibilidad de compra;
- impuestos;
- alcance exacto de Session 101;
- reglas de reprogramacion;
- reglas ante ausencia;
- cupones iniciales;
- acceso tras disputa;
- criterios para acceso manual;
- afiliados.

Recomendaciones tecnicas:

- usar cuenta antes de pago;
- usar pago unico;
- bloquear compra duplicada del mismo producto en lanzamiento;
- guardar snapshots comerciales para auditoria;
- no crear semana de acompanamiento en el modelo inicial;
- no conceder acceso desde el redirect de checkout.

## 18. Recomendacion para Fase 8.1

Antes de integrar Stripe, Fase 8.1 deberia definir el esquema exacto sin aplicar migraciones todavia:

- `commercial_prices`;
- `stripe_customers`;
- `purchases`;
- `purchase_events`;
- relacion entre purchase y enrollment;
- reglas RLS/admin para lectura operativa;
- contratos de repository/service para checkout y webhooks;
- checklist de variables de entorno;
- estrategia de idempotencia por evento Stripe.

La implementacion de Stripe debe empezar solo despues de confirmar las decisiones comerciales abiertas: precio, moneda, reembolso, compra duplicada, impuestos y reglas definitivas de Session 101.

## 19. Nota De Auditoria Fase 8.4B

La implementacion actual aplaza `commercial_prices` y `stripe_customers`.
Checkout resuelve el Price ID desde configuracion server-side y crea una
`Purchase pending` antes de devolver la URL.

Hardening aplicado:

- una sola `Purchase pending` por `profile_id/product_id`;
- `amount_refunded_minor` como acumulado de refunds;
- maquina de estados en `PurchaseService`;
- Webhooks con patron `insert-first` por `stripe_event_id`;
- errores permanentes responden 200 tras registrarse;
- errores reintentables responden 500;
- Enrollment sigue fuera de alcance.
