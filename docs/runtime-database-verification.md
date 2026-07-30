# Runtime Database Verification

FASE 8.5C valida la base local de Supabase en ejecucion. No se aplicaron
migraciones remotas, no se ejecuto `db push`, no se hizo staging, commit ni
push.

## 1. Entorno

- Fecha de verificacion: 2026-07-30.
- Supabase CLI local: `2.110.0`.
- PostgreSQL local: accesible en `127.0.0.1:54322`.
- PostgREST local: accesible en `127.0.0.1:54321`.
- Docker CLI: no disponible en PATH durante esta sesion.
- `supabase/.temp/project-ref`: no existe.

`npx.cmd supabase status` no pudo completarse porque la CLI requiere Docker o
Podman en PATH para inspeccionar contenedores.

## 2. Metodo de conexion

Se uso una conexion PostgreSQL directa y local contra `127.0.0.1:54322`.

No se imprimieron connection strings completas ni claves locales. La contrasena
local se leyo desde los secretos temporales generados por Supabase y se uso solo
en memoria durante la verificacion.

## 3. Migration history

Consulta local:

- Tabla: `supabase_migrations.schema_migrations`.
- Migraciones aplicadas: 16.
- Ultima version: `20260729000000`.

No se modifico migration history.

## 4. Tablas y columnas

Tablas confirmadas en runtime:

- `public.profiles`
- `public.products`
- `public.enrollments`
- `public.academy_modules`
- `public.academy_module_videos`
- `public.academy_resources`
- `public.purchases`
- `public.purchase_events`
- `public.stripe_webhook_events`

Columnas comerciales confirmadas:

- `purchases`: `id`, `purchase_number`, `profile_id`, `product_id`,
  `enrollment_id`, `status`, `payment_provider`,
  `provider_checkout_session_id`, `provider_payment_intent_id`,
  `amount_total_minor`, `amount_refunded_minor`, `currency`, `created_at`,
  `updated_at`.
- `purchase_events`: `id`, `purchase_id`, `event_type`, `source`,
  `actor_profile_id`, `occurred_at`, `summary`, `metadata`, `created_at`.
- `stripe_webhook_events`: `id`, `stripe_event_id`, `event_type`,
  `api_version`, `livemode`, `processing_status`, `attempt_count`,
  `last_error_code`, `purchase_id`, `received_at`, `processed_at`,
  `error_message`, `payload_summary`, `created_at`, `updated_at`.

Tipos relevantes confirmados:

- UUID para ids y foreign keys.
- `bigint` para amounts.
- `integer` para `attempt_count`.
- `jsonb` para `metadata` y `payload_summary`.
- `timestamp with time zone` para fechas.

## 5. Purchase number

Prueba ejecutada en transaccion con rollback:

- Se insertaron dos Purchases validas.
- `purchase_number` fue generado por default PostgreSQL.
- Formato observado: `ITA-000004`, `ITA-000005`.
- Prefijo `ITA-` correcto.
- Padding de seis digitos correcto.
- Valores unicos.

La secuencia confirmada es `public.purchase_number_seq`.

## 6. Unique purchase number

Prueba ejecutada en rollback:

- Insercion manual duplicando `purchase_number`.
- Resultado: rechazo por `23505`.
- Constraint real: `purchases_purchase_number_key`.

## 7. Unique pending

Prueba ejecutada en rollback:

- Segunda Purchase `pending` para el mismo `profile_id/product_id`.
- Resultado: rechazo por `23505`.
- Indice real: `purchases_one_pending_per_profile_product_key`.
- Tras cambiar la primera Purchase a `canceled`, una nueva `pending` fue
  aceptada.
- Purchases historicas no pending no bloquearon la nueva pending.

## 8. Refund constraints

Pruebas invalidas rechazadas:

- `amount_total_minor` negativo.
- `amount_refunded_minor` negativo.
- `amount_refunded_minor` mayor que `amount_total_minor`.

Constraints reales:

- `purchases_amount_total_minor_check`.
- `purchases_amount_refunded_minor_check`.

Nota: para `amount_total_minor = -1`, PostgreSQL reporto primero
`purchases_amount_refunded_minor_check` porque el default `0` de
`amount_refunded_minor` queda por encima del total negativo.

## 9. Currency

Validas:

- `USD`
- `EUR`

Invalidas rechazadas:

- `usd`
- `US`
- `USDD`
- `123`
- cadena vacia

Constraint real: `purchases_currency_check`.

## 10. PurchaseStatus

Valores permitidos por constraint:

- `pending`
- `paid`
- `failed`
- `canceled`
- `refunded`
- `partially_refunded`
- `disputed`

Valor invalido probado:

- `completed`

Resultado: rechazo por `purchases_status_check`.

## 11. PaymentProvider

Valor valido:

- `stripe`

Valor invalido probado:

- `paypal`

Resultado: rechazo por `purchases_payment_provider_check`.

## 12. PurchaseEvent constraints

Valores relevantes permitidos por constraint:

- `purchase_created`
- `payment_pending`
- `payment_confirmed`
- `payment_failed`
- `purchase_canceled`
- `refund_completed`
- `partial_refund_completed`
- `dispute_opened`

Tambien existen en el constraint:

- `refund_requested`
- `dispute_won`
- `dispute_lost`
- `enrollment_granted`
- `enrollment_revoked`
- `manual_adjustment`

Sources permitidos:

- `system`
- `stripe_webhook`
- `admin`
- `student`

Valores invalidos probados:

- `event_type = bad_event`
- `source = external`

Resultado:

- `purchase_events_event_type_check`
- `purchase_events_source_check`

Foreign key a Purchase:

- `purchase_events_purchase_id_fkey`

## 13. Webhook constraints

`stripe_webhook_events` verificado:

- `stripe_event_id` unique.
- `attempt_count = 0` valido.
- `attempt_count < 0` rechazado.
- `payload_summary` es `jsonb`.
- `purchase_id` es nullable.

Estados permitidos:

- `received`
- `processing`
- `processed`
- `failed`
- `ignored`

Estado invalido probado:

- `done`

Constraints reales:

- `stripe_webhook_events_event_id_key`
- `stripe_webhook_events_attempt_count_check`
- `stripe_webhook_events_processing_status_check`

## 14. Indices

Indices comerciales confirmados:

`purchases`:

- `purchases_purchase_number_key`
- `purchases_provider_checkout_session_id_key`
- `purchases_provider_payment_intent_id_key`
- `purchases_profile_product_status_created_at_idx`
- `purchases_product_id_status_idx`
- `purchases_one_pending_per_profile_product_key`
- `purchases_created_at_idx`
- `purchases_enrollment_id_idx`

`purchase_events`:

- `purchase_events_purchase_id_created_at_idx`
- `purchase_events_event_type_created_at_idx`

`stripe_webhook_events`:

- `stripe_webhook_events_event_id_key`
- `stripe_webhook_events_processing_status_received_at_idx`
- `stripe_webhook_events_event_type_received_at_idx`
- `stripe_webhook_events_purchase_id_idx`

## 15. RLS comercial

RLS esta habilitado en:

- `profiles`
- `products`
- `enrollments`
- `purchases`
- `purchase_events`
- `stripe_webhook_events`

Policies comerciales confirmadas en catalogo:

- `profiles_authenticated_read_own`
- `profiles_admin_read`
- `purchases_authenticated_read_own`
- `purchases_admin_read`
- `purchase_events_authenticated_read_own`
- `purchase_events_admin_read`
- `stripe_webhook_events_admin_read`

Prueba end-to-end por rol:

- Intentada mediante `SET LOCAL ROLE authenticated` y claims locales.
- Resultado bloqueado por grants SQL insuficientes antes de evaluar
  plenamente RLS.

## 16. RLS academica restrictiva

RLS esta habilitado en:

- `academy_modules`
- `academy_module_videos`
- `academy_resources`

Policies restrictivas confirmadas:

- `academy_modules_enrolled_read_published`
- `academy_module_videos_enrolled_read_published`
- `academy_resources_enrolled_read_published`

Tambien existen policies admin para lectura/escritura CMS segun tabla.

Prueba end-to-end por rol:

- Intentada con datos ficticios y rollback.
- Bloqueada por grants SQL insuficientes para roles API.

## 17. Grants

Consulta de `information_schema.role_table_grants` mostro que `anon`,
`authenticated` y `service_role` no tienen `SELECT`, `INSERT`, `UPDATE` ni
`DELETE` sobre las tablas publicas verificadas.

Los privilegios visibles fueron:

- `REFERENCES`
- `TRIGGER`
- `TRUNCATE`

Esto es un hallazgo runtime importante: las policies existen, pero los grants
actuales impiden que los roles API operen sobre las tablas antes de llegar a la
decision de RLS.

No se modificaron grants en esta fase.

## 18. Limitaciones

- Docker CLI no esta disponible en PATH.
- `npx.cmd supabase status` no puede inspeccionar contenedores.
- `npx.cmd supabase gen types ... --local` falla por ausencia de Docker/Podman.
- `npx.cmd supabase gen types ... --db-url` tambien falla por el mismo motivo.
- No se genero `src/lib/supabase/database.types.ts` para no fabricar tipos
  manuales.
- RLS end-to-end quedo limitado por grants SQL insuficientes.

## 19. Tipos generados

Comando intentado:

```powershell
npx.cmd supabase gen types typescript --local --schema public
```

Resultado:

- fallido por `docker: command not found`.

Comando alternativo intentado:

```powershell
npx.cmd supabase gen types typescript --db-url "postgresql://..." --schema public
```

Resultado:

- fallido por `docker: command not found`.

No se creo `database.types.ts`.

## 20. Separacion database/domain types

Al no generarse tipos oficiales, no se integraron clientes tipados con
`createClient<Database>()`.

La separacion esperada se mantiene conceptualmente:

- Database types: representacion generada del schema Supabase.
- Domain types: reglas de negocio, estados comerciales y mappers explicitos.

Diferencias observadas:

- Los constraints no se expresan automaticamente como unions si los tipos se
  generan desde SQL.
- `PurchaseStatus` y tipos comerciales de dominio siguen siendo defensa de
  TypeScript.
- `purchase_number`, `created_at`, `updated_at` y defaults deben poder omitirse
  en inserts.

## 21. Archivos modificados

Archivos de esta fase:

- `docs/runtime-database-verification.md`
- `docs/local-migration-rehearsal.md`
- `docs/local-tooling-setup.md`

No se modifico `docs/student-learning-workflow.md`.

## 22. Proximo checkpoint Git

Antes de un checkpoint posterior:

1. Restaurar Docker CLI en PATH.
2. Ejecutar `npx.cmd supabase status`.
3. Generar tipos locales oficiales.
4. Tipar clientes Supabase si compila sin refactor excesivo.
5. Corregir grants en una migracion separada si se autoriza.
6. Repetir RLS end-to-end.
7. Ejecutar lint/build.

No hacer `db push` ni cambios remotos hasta autorizacion explicita.

## 23. Actualizacion Fase 8.5C1

Se preparo una migracion incremental para endurecer grants runtime:

```text
supabase/migrations/20260730000000_harden_runtime_grants.sql
```

La migracion revoca permisos inseguros de `anon` y `authenticated` y concede
los permisos minimos esperados para que RLS sea evaluable.

Estado actual:

- Docker sigue sin estar visible para Codex.
- `npx.cmd supabase status` falla con `docker: command not found`.
- `npm.cmd run supabase:reset` falla con `failed to inspect service`.
- No se aplico la migracion localmente.
- No se genero `src/lib/supabase/database.types.ts`.
- No se tiparon clientes ni repositories con `Database`.

La documentacion detallada de esta subfase esta en:

```text
docs/runtime-grants-and-rls.md
```

## 24. Actualizacion Fase 8.5D

La integracion de tipos comerciales quedo preparada con:

- `src/lib/supabase/database.types.ts`;
- clientes Supabase tipados con `Database`;
- repositories comerciales tipados con aliases `Row`, `Insert` y `Update`;
- eliminacion de casts inseguros en repositories comerciales objetivo.

Durante la integracion, `database.types.ts` confirmo que
`academy_modules.thumbnail_url` no existe en el schema actual. Los repositories
de contenido dejaron de seleccionar o actualizar esa columna inexistente y los
mappers de modulo retornan `thumbnailUrl: null` hasta que se autorice una
migracion especifica.

La preparacion de checkpoint esta documentada en:

```text
docs/commercial-checkpoint-readiness.md
```
