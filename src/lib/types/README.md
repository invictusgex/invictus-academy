# Types

Esta carpeta alojara tipos compartidos de dominio e infraestructura controlada.

## Proposito

Centralizar contratos TypeScript que sean reutilizables entre hooks,
repositories, services y adaptadores.

## Responsabilidades

- Definir entidades conceptuales del dominio.
- Definir estados compartidos de carga, error y resultado.
- Evitar duplicacion de interfaces entre capas.
- Separar tipos internos de respuestas crudas de proveedores.

## Que tipos de archivos viviran aqui

- `user.types.ts`
- `product.types.ts`
- `purchase.types.ts`
- `enrollment.types.ts`
- `program.types.ts`
- `progress.types.ts`
- `result.types.ts`

## Que NO debe vivir aqui

- Implementaciones.
- Funciones con efectos secundarios.
- Componentes React.
- Configuracion de proveedores.
- Tipos temporales especificos de una sola pantalla.

## Relacion con otras capas

Los tipos deben ser consumidos por hooks, repositories y services. Los adapters
pueden traducir desde tipos externos hacia estos contratos internos para evitar
que Supabase u otros proveedores se filtren a la UI.
