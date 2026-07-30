# Commercial Test Matrix

## Checkout

- Usuario no autenticado: debe responder 401.
- `productSlug` invalido: debe responder 400.
- Product inactivo: debe responder `PRODUCT_NOT_PURCHASABLE`.
- Enrollment activo: debe responder `ALREADY_ENROLLED`.
- Price inactivo: debe responder `PRICE_NOT_PURCHASABLE`.
- Price recurrente: debe responder `PRICE_NOT_PURCHASABLE`.
- `unit_amount` null: debe responder `PRICE_AMOUNT_UNAVAILABLE`.
- Falla crear Purchase: no debe crear Checkout Session.
- Falla Stripe tras crear Purchase: debe cancelar Purchase.
- Falla asociar Checkout: debe intentar expirar Session y no devolver URL.
- Clic doble: debe bloquear con `DUPLICATE_PENDING_PURCHASE`.
- Pending expirada: debe cancelarse antes de crear una nueva.

## Webhook

- Firma ausente: 400.
- Firma invalida: 400.
- Evento ignorado: 200.
- Evento duplicado `processed`: 200 duplicate.
- Requests concurrentes con mismo `stripe_event_id`: solo uno procesa dominio.
- `processing` antiguo: permite retry controlado.
- Purchase no encontrada: permanent failure 200.
- Metadata mismatch: permanent failure 200.
- Amount mismatch: permanent failure 200.
- Currency mismatch: permanent failure 200.
- `payment_intent.succeeded` antes de `checkout.session.completed`: resuelve por metadata.
- `payment_intent.payment_failed` despues de `paid`: no debe revertir.
- Refund parcial repetido: no debe duplicar evento si el acumulado no aumenta.
- Refund parcial adicional: debe actualizar `amount_refunded_minor`.
- Refund total: debe marcar `refunded`.
- Dispute sobre paid: debe marcar `disputed`.
- Dispute sobre refunded: no debe sobrescribir `refunded`.
- Evento transitorio: debe responder 500.
- Evento permanente: debe quedar registrado y responder 200.
