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

El archivo `client.ts` crea una unica instancia compartida del cliente Supabase.
Su unica responsabilidad es leer variables de entorno y exponer el cliente para
las capas internas que lo necesiten.

Variables esperadas:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Uso previsto:

```ts
import { supabase } from "@/lib/database/client";
```

Reglas:

- Importar el cliente desde repositories, adapters o services de infraestructura.
- No importar el cliente directamente desde componentes React.
- No colocar reglas de negocio en `client.ts`.
- No colocar consultas de autenticacion, progreso, compras o contenido en
  `client.ts`.
- No guardar valores reales de entorno en `.env.example`.
