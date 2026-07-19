# Arquitectura de capas en src/lib

Este directorio agrupa la base tecnica compartida para autenticacion,
persistencia, repositorios, servicios y tipos de dominio. La integracion futura
con Supabase debe vivir detras de estas capas para que los componentes React no
dependan directamente del proveedor.

## Flujo general

```text
UI
 |
 v
Hooks
 |
 v
Repositories
 |
 v
Services
 |
 v
Database
```

## Flujo de una peticion

1. Un componente de UI renderiza una pantalla y llama un hook.
2. El hook prepara estado de carga, error y datos para la UI.
3. El hook invoca un repository para leer o escribir informacion.
4. El repository expone una interfaz estable del dominio.
5. El repository delega reglas o coordinacion compleja a services cuando aplica.
6. El service valida reglas de negocio, permisos, auth o efectos externos.
7. La capa database ejecuta la comunicacion con el proveedor real de datos.
8. La respuesta vuelve por las mismas capas hasta que la UI recibe datos listos.

## Relacion entre capas

- `auth`: administra contratos y notas de autenticacion futura.
- `database`: contiene adaptadores de persistencia y clientes de infraestructura.
- `repositories`: define acceso a datos orientado al dominio.
- `services`: coordina reglas de negocio y flujos entre repositorios.
- `types`: centraliza tipos compartidos que no pertenecen a una pantalla.

## Convenciones de nombres

### Repositories

- Archivo: `*.repository.ts`
- Ejemplo: `progress.repository.ts`
- Export principal: `ProgressRepository`
- Responsabilidad: acceso a datos del dominio, no reglas visuales.

### Services

- Archivo: `*.service.ts`
- Ejemplo: `access.service.ts`
- Export principal: `AccessService`
- Responsabilidad: reglas de negocio, permisos, coordinacion y flujos.

### Types

- Archivo: `*.types.ts`
- Ejemplo: `progress.types.ts`
- Exportaciones: interfaces y tipos del dominio.
- Responsabilidad: contratos compartidos, no implementaciones.

### Adapters

- Archivo: `*.adapter.ts`
- Ejemplo: `supabase-progress.adapter.ts`
- Responsabilidad: traducir entre proveedores externos y contratos internos.

### Utilities

- Archivo: `*.utils.ts`
- Ejemplo: `progress.utils.ts`
- Responsabilidad: funciones puras y pequenas, sin estado global ni IO externo.

## Integracion futura con Supabase

Supabase no debe importarse desde componentes React. La integracion futura debe
seguir este camino:

```text
Componentes React
   |
   v
Hooks de dominio
   |
   v
Repositories
   |
   v
Services
   |
   v
Supabase adapter / database client
```

La UI solo debe conocer datos del dominio y acciones de alto nivel. Si se cambia
Supabase por otro proveedor, el impacto deberia limitarse a `database`,
adaptadores y repositories, sin reescribir pantallas.

## Que no debe vivir en src/lib

- Componentes React de presentacion.
- Estilos de UI.
- Paginas o rutas de Next.js.
- Logica especifica de una sola pantalla.
- Secretos, tokens o credenciales.
- Consultas directas desde componentes hacia proveedores externos.
