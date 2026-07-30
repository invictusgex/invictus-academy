# Database

Esta carpeta alojara la capa de infraestructura para persistencia cuando se
integre una base de datos real.

## Proposito

Encapsular clientes, adaptadores y configuracion tecnica de acceso a datos sin
exponer el proveedor a la UI.

## Responsabilidades

- Crear clientes internos de base de datos.
- Mantener adaptadores para proveedores externos.
- Traducir errores tecnicos a errores controlados por la aplicacion.
- Servir como limite entre dominio e infraestructura.

## Que tipos de archivos viviran aqui

- `database.client.ts`
- `supabase.client.ts` cuando se integre Supabase.
- `*.adapter.ts`
- `database.errors.ts`
- Documentacion de variables de entorno esperadas.

## Que NO debe vivir aqui

- Componentes React.
- Hooks de UI.
- Reglas de negocio del programa.
- Logica de precios o permisos.
- Modelos acoplados directamente a pantallas.

## Relacion con otras capas

`database` debe ser consumida por repositories y, en casos justificados, por
services de infraestructura. Los componentes nunca deben importar clientes de
base de datos.

## Cliente Supabase

El archivo `client.ts` crea una unica instancia compartida del cliente Supabase
para el entorno actual. En navegador usa `createBrowserClient` de
`@supabase/ssr` para mantener la sesion basada en cookies. En servidor mantiene
un cliente anonimo simple para lecturas internas existentes que no dependen de
cookies.

Para Route Handlers, Server Actions y Server Components que necesiten identidad
autenticada, debe usarse `src/lib/supabase/server.ts`, que crea un cliente nuevo
por request leyendo cookies con `next/headers`.

Variables esperadas:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Uso previsto:

```ts
import { getSupabaseClient } from "@/lib/database/client";
```

Reglas:

- Importar el cliente desde repositories, adapters o services de infraestructura.
- No importar el cliente directamente desde componentes React.
- No colocar reglas de negocio en `client.ts`.
- No colocar consultas de autenticacion, progreso, compras o contenido en
  `client.ts`.
- No guardar valores reales de entorno en `.env.example`.

## Auth server-side

`src/lib/supabase/server.ts` existe para flujos server-side que necesitan
validar sesion sin recibir tokens desde el navegador.

Reglas:

- Crear un cliente nuevo por request.
- Leer la sesion desde cookies.
- No exponer access tokens, refresh tokens ni sesiones crudas a componentes.
- No usar service role keys dentro de `src`.

`src/proxy.ts` ejecuta el refresco minimo de cookies recomendado por
`@supabase/ssr` para reducir expiraciones inesperadas de sesion. No protege
rutas, no redirige usuarios y no modifica permisos.
