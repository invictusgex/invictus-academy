# Supabase Migrations

Esta carpeta contiene la configuracion local de Supabase y las migraciones SQL
del proyecto Invictus Trading Academy.

## Estructura actual

```text
supabase/
  config.toml
  migrations/
    20260719213351_initial_schema.sql
```

## Primera migracion

La migracion `20260719213351_initial_schema.sql` define la estructura inicial de
base de datos para preparar autenticacion, acceso al programa y persistencia de
progreso sin conectar todavia el frontend.

Tablas creadas:

- `profiles`
- `products`
- `enrollments`
- `progress`

Todas las tablas usan:

- `id` UUID como clave primaria.
- `created_at`.
- `updated_at`.

## Relaciones

```text
auth.users 1 ---- 1 public.profiles

public.profiles 1 ---- * public.enrollments
public.products 1 ---- * public.enrollments

public.profiles 1 ---- * public.progress
public.products 1 ---- * public.progress
```

## Seed inicial

La primera migracion incluye un producto inicial:

```text
title: Trading Basado en Datos
slug: trading-basado-en-datos
status: active
```

## Limites de esta etapa

- No se implementa autenticacion.
- No se crean consultas desde la aplicacion.
- No se modifica el frontend.
- No se conecta el progreso a Supabase.
- No se elimina localStorage.
- No se habilita Row Level Security.
- No se crean funciones SQL.
- No se crean triggers.
