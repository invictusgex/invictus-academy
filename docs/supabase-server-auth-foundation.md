# Supabase Server Auth Foundation

FASE 8.2A prepara autenticacion server-side para futuras Route Handlers, Server
Actions y Server Components. No implementa Checkout, Webhooks, purchases,
enrollments por pago ni nuevas pantallas.

## 1. Problema que bloqueaba Stripe Checkout

Stripe Checkout necesita que el servidor determine el usuario autenticado sin
confiar en `user_id`, `profile_id`, email, token o precio enviado por el
navegador.

Antes de esta fase, la aplicacion podia iniciar sesion desde cliente, pero no
existia una base server-side con cookies para validar al usuario dentro de una
Route Handler.

## 2. Arquitectura anterior

El flujo de login visible era:

```text
LoginForm
  -> useAuth()
  -> AuthProvider
  -> AuthRepository
  -> AuthService
  -> Supabase Auth
```

`AuthProvider` se mantiene como estado global cliente. `LoginForm`,
`LogoutButton`, `RequireAuth` y `RequireEnrollment` no importan Supabase
directamente.

Antes de adoptar `@supabase/ssr`, el cliente compartido usaba
`createClient()` desde `@supabase/supabase-js`. Ese cliente delega la
persistencia de sesion al comportamiento browser de Supabase, pero no ofrece por
si solo una base explicita para cookies SSR.

El `localStorage` existente pertenece al cache de progreso del alumno y no debe
usarse como fuente de verdad para APIs server-side.

## 3. Arquitectura implementada

```text
Browser client
  -> createBrowserClient()
  -> cookies administradas por @supabase/ssr

Server request
  -> src/proxy.ts
  -> updateSupabaseSession()
  -> createServerClient()
  -> supabase.auth.getUser()

Route Handler futura
  -> requireServerAuthContext()
  -> createSupabaseServerClient()
  -> supabase.auth.getUser()
  -> ProfileRepository.getById()
```

## 4. Cliente browser

`src/lib/database/client.ts` conserva la API existente `getSupabaseClient()`,
pero en navegador crea el cliente con:

```ts
createBrowserClient(config.url, config.anonKey)
```

Esto evita cambiar masivamente `AuthProvider`, repositories o componentes ya
existentes.

## 5. Cliente server

`src/lib/supabase/server.ts` expone `createSupabaseServerClient()`.

Reglas:

- usa `createServerClient()` de `@supabase/ssr`;
- lee cookies con `cookies()` de `next/headers`;
- crea un cliente nuevo por request;
- usa solo `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
- no usa singleton;
- no usa service role;
- esta protegido con `server-only`.

## 6. Cookies

Las cookies son gestionadas por `@supabase/ssr` mediante `getAll` y `setAll`.
Cuando Next.js no permite escribir cookies desde un contexto concreto, la
escritura se ignora de forma segura y el refresco queda cubierto por `proxy.ts`.

## 7. Validacion del usuario

`src/lib/auth/server.ts` valida identidad con:

```ts
supabase.auth.getUser()
```

No se usa `getSession()` como prueba suficiente de identidad server-side.

Funciones disponibles:

- `getCurrentServerUser()`
- `requireServerUser()`
- `requireServerAuthContext()`

Ninguna funcion devuelve access token, refresh token ni sesion completa.

## 8. Resolucion del profile

`ProfileRepository.getById()` recibe el cliente Supabase server-side ya creado
para el request y consulta:

```text
profiles.id = auth user id validado
```

No acepta IDs enviados por el navegador. La consulta respeta RLS porque usa anon
key y la sesion del usuario autenticado.

Datos devueltos:

- `id`
- `email`
- `fullName`
- `role`

## 9. Proxy de Next 16

Next.js 16 llama `Proxy` al antiguo middleware. Se creo `src/proxy.ts` porque
`@supabase/ssr` recomienda refrescar cookies de sesion en una capa previa al
render.

El proxy:

- no protege rutas;
- no redirige;
- no concede enrollment;
- no consulta tablas de dominio;
- excluye assets estaticos y rutas internas de Next.js.

Las rutas publicas siguen renderizando normalmente.

## 10. Uso previsto en Route Handlers

Una Route Handler futura de Checkout podra hacer:

```ts
const { user, profile } = await requireServerAuthContext();
```

Luego el servidor decidira producto, price, moneda, metadata y URLs. El cliente
solo debera enviar una entrada minima como `productSlug`.

## 11. Errores tipados

`src/lib/auth/server-errors.ts` define:

- `UNAUTHENTICATED`
- `PROFILE_NOT_FOUND`
- `AUTH_PROVIDER_ERROR`

Los errores internos de Supabase quedan encapsulados como `cause` y no deben
exponerse directamente al cliente.

## 12. Seguridad

Confirmaciones de diseno:

- la anon key puede vivir en cliente;
- no se usa `SUPABASE_SERVICE_ROLE_KEY`;
- no se copia ningun token al dominio interno;
- no se reciben IDs de usuario o perfil desde el navegador;
- ningun Client Component importa utilidades server-only;
- `RequireAuth` cliente no debe considerarse proteccion suficiente para APIs;
- Checkout no fue implementado.

## 13. Limitaciones

- La resolucion de `profiles` depende de que las policies RLS permitan al
  usuario leer su propio perfil.
- No se agregaron callbacks OAuth ni `exchangeCodeForSession` porque el flujo
  actual es email/password y no existe OAuth ni magic link.
- No se crearon endpoints permanentes de prueba.

## 14. Pruebas manuales pendientes

Antes de retomar Checkout conviene validar en navegador:

- login email/password mantiene sesion;
- logout elimina sesion;
- una Route Handler temporal local puede responder 401 sin sesion;
- una Route Handler temporal local puede resolver `user` y `profile` con sesion.

Esa prueba no debe dejar endpoints de diagnostico versionados.

## 15. Pasos para retomar Fase 8.2

1. Crear la Route Handler de Checkout.
2. Aceptar solo `productSlug`.
3. Usar `requireServerAuthContext()`.
4. Resolver producto y configuracion de precio en servidor.
5. Crear Checkout Session con metadata minima.
6. Mantener enrollments desactivados hasta Webhooks verificados.

Nota Fase 8.2B: la infraestructura ya fue consumida por
`POST /api/stripe/checkout` mediante `requireServerAuthContext()`. La Route
Handler valida usuario y profile en servidor, pero no concede acceso academico.

## 16. Confirmacion de alcance

Esta fase no implemento:

- Stripe Checkout;
- Webhooks;
- purchases;
- enrollments por pago;
- Session 101;
- cupones;
- customer portal;
- nueva UI de autenticacion.
