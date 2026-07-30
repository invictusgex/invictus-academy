# Auth

Esta carpeta documenta y alojara la base tecnica de autenticacion cuando el
proyecto incorpore un proveedor real.

## Proposito

Centralizar contratos, adaptadores y utilidades relacionadas con identidad,
sesion y estado autenticado del usuario.

## Responsabilidades

- Definir como se obtiene el usuario autenticado.
- Definir estados de sesion: cargando, autenticado, anonimo y error.
- Preparar contratos para registro, login, logout y recuperacion de sesion.
- Exponer una interfaz interna que no dependa directamente de Supabase.

## Que tipos de archivos viviran aqui

- `client.ts`
- `service.ts`
- `types.ts`
- `auth.adapter.ts`
- `session.utils.ts`
- README y notas de integracion.

## Archivos actuales

- `client.ts`: reutiliza la instancia compartida de Supabase y centraliza el
  acceso a `supabase.auth`.
- `server.ts`: resuelve usuario autenticado y perfil desde servidor usando
  cookies, sin aceptar identidad enviada por el navegador.
- `server-errors.ts`: define errores tipados para rutas server-side:
  `UNAUTHENTICATED`, `PROFILE_NOT_FOUND` y `AUTH_PROVIDER_ERROR`.
- `types.ts`: define los contratos internos `AuthUser`, `AuthSession` y
  `AuthState`.
- `service.ts`: expone funciones tecnicas minimas para usuario actual, sesion,
  login futuro, logout futuro y recuperacion de password futura.

## Que NO debe vivir aqui

- Componentes visuales de login.
- Formularios React.
- Reglas de compra o progreso.
- Consultas directas a tablas de contenido.
- Secretos o claves privadas.

## Relacion con otras capas

`auth` entrega identidad a `services` y `repositories`, pero no debe decidir por
si solo si un usuario tiene acceso al programa. Los permisos deben combinar auth
con `Enrollment` mediante servicios de acceso.

## Auth en servidor

Las rutas server-side deben usar `requireServerUser()` o
`requireServerAuthContext()` desde `server.ts`.

Flujo:

```text
Route Handler / Server Action
  -> requireServerAuthContext()
  -> createSupabaseServerClient()
  -> supabase.auth.getUser()
  -> ProfileRepository.getById()
```

Reglas:

- No recibir `user_id`, `profile_id`, email, token ni sesion desde el cliente.
- No devolver tokens al frontend.
- No importar `server.ts` desde Client Components.
- Tratar `PROFILE_NOT_FOUND` como una falla controlada de datos, no como acceso
  autorizado.
