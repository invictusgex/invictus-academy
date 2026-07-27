# RC1.6 Security Audit & Hardening

## 1. Alcance auditado

Se revisaron Auth, Providers, Contexts, Repositories, Services, Storage, Supabase, RLS, variables de entorno, componentes cliente, layouts privados, rutas de Admin, rutas de Academy, escenarios, contenido, recursos y `StorageService`.

La auditoria se realizo antes de integrar pagos. No se modifico Stripe, UX, CMS funcional, progreso academico ni dependencias.

## 2. Vulnerabilidades encontradas

- Las politicas originales de lectura publicada de `academy_modules`, `academy_module_videos` y `academy_resources` permitian `to anon, authenticated`. Como la anon key de Supabase es publica por diseno, esto podia permitir lectura directa del contenido publicado fuera del flujo privado.
- El dominio interno de Auth exponia `accessToken` y `refreshToken` dentro de `AuthSession`, aunque ningun consumidor de la app los usaba.
- `AdminEnrollmentsService` podia devolver `error.message` para errores inesperados. En escenarios de error de repositorio, eso podia exponer detalles tecnicos de Supabase en UI administrativa.

## 3. Problemas corregidos

- Se creo una migracion nueva para reemplazar las politicas de lectura publicada del CMS por politicas `to authenticated` con enrollment activo del producto correspondiente.
- Se mantuvieron las politicas administrativas existentes para lectura completa por usuarios presentes en `public.admin_users`.
- Se removieron `accessToken` y `refreshToken` del `AuthSession` mapeado por la aplicacion.
- Se ajusto `AdminEnrollmentsService` para mostrar mensajes especificos solo en errores de validacion propios y usar un mensaje generico ante errores tecnicos.

## 4. Problemas aceptados temporalmente

- La proteccion de rutas privadas es client-side mediante layouts y guards de React. El control fuerte de datos queda delegado a RLS de Supabase.
- No se ejecuto `npm audit` ni se instalaron analizadores adicionales porque la fase no permite nuevas dependencias y la validacion solicitada es local.
- Las signed URLs siguen existiendo en memoria del cliente durante su ventana temporal; esto es inherente al acceso privado a Storage desde navegador autenticado.

## 5. Riesgos residuales

- La nueva migracion RLS debe ejecutarse en Supabase antes de considerar cerrada la exposicion anonima del CMS publicado.
- Cualquier URL externa registrada por administradores depende de la confianza operacional del panel admin; la app valida protocolo `http/https`, pero no aplica listas de dominios permitidos.
- El uso de anon key en cliente es correcto para Supabase, pero exige que todas las tablas sensibles mantengan RLS estricta.
- Las rutas privadas dependen de que los layouts `src/app/academy/layout.tsx` y `src/app/admin/layout.tsx` sigan envolviendo toda la rama correspondiente.

## 6. Recomendaciones antes de produccion

- Ejecutar la migracion `20260721011000_restrict_academy_content_read_policies.sql` y verificar con usuarios anonimo, alumno activo, alumno sin acceso y admin.
- Revisar en Supabase que `academy-assets` permanece privado y que no existe acceso anonimo a `storage.objects`.
- Mantener cualquier future server action o route handler dentro del patron `UI -> Service -> Repository`.
- Definir una politica operacional para dominios externos permitidos si se empieza a aceptar contenido enlazado desde fuentes no controladas.
- Activar monitoreo de errores sin mostrar detalles tecnicos al usuario final.

## 7. Checklist para Stripe

- No usar `NEXT_PUBLIC_` para secretos de Stripe.
- Procesar webhooks en servidor con verificacion de firma.
- Nunca conceder enrollments desde el cliente.
- Crear o actualizar enrollments solo despues de confirmar pago valido.
- Hacer que el webhook sea idempotente por evento o checkout session.
- Validar que el producto comprado corresponde a `trading-basado-en-datos`.
- Registrar errores tecnicos de pago internamente sin exponer payloads sensibles al usuario.
- Probar RLS despues de crear enrollments desde el flujo comercial.

## Confirmaciones

- No se encontro `service_role` en `src`.
- No se encontraron llamadas directas a Supabase desde componentes React; las llamadas estan en repositorios, auth o database.
- `academy-assets` esta definido como bucket privado en la migracion de Storage.
- `src` usa `createSignedUrl`; no se encontro uso de `getPublicUrl` en codigo activo.
- `ProtectedLayout` protege `/academy` con `RequireAuth` y `RequireEnrollment`.
- `AdminProtectedLayout` protege `/admin` con `RequireAuth` y `RequireAdmin`.
