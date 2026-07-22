# Storage v1

Esta fase prepara la infraestructura de Supabase Storage para assets de
Invictus Trading Academy. No implementa subida desde formularios ni cambia UI.

## Bucket

La plataforma usa un solo bucket privado:

```text
academy-assets
```

No se crean buckets por area. La organizacion se hace mediante rutas internas.

## Rutas Oficiales

Toda subida futura debe usar exclusivamente estas rutas:

```text
modules/thumbnails/
scenarios/thumbnails/
resources/pdf/
resources/docs/
resources/images/
```

Estas rutas pertenecen a Supabase Storage. No representan carpetas locales del
repositorio.

## Migracion

Archivo:

```text
supabase/migrations/20260721010000_storage_academy_assets.sql
```

La migracion:

- crea el bucket `academy-assets` solo si no existe;
- lo deja privado;
- agrega policies sobre `storage.objects`;
- permite lectura a alumnos autenticados con enrollment activo y vigente;
- permite lectura a administradores registrados en `public.admin_users`;
- permite escritura solo a administradores registrados en `public.admin_users`;
- no crea acceso anonimo;
- no modifica buckets existentes.

## Repository

Archivo:

```text
src/lib/repositories/storage.repository.ts
```

Responsabilidades:

- encapsular llamadas a `supabase.storage`;
- operar siempre sobre `academy-assets`;
- exponer metodos base para subir, borrar, reemplazar y generar URLs firmadas
  temporales.

Los componentes no deben importar Supabase ni llamar Storage directamente.

## Service

Archivo:

```text
src/lib/services/storage.service.ts
```

Responsabilidades:

- construir rutas validas;
- sanitizar nombres originales;
- generar nombres definitivos con identificadores unicos;
- validar extension;
- validar tipo MIME;
- validar tamano maximo;
- convertir errores tecnicos en respuestas controladas;
- delegar operaciones reales al repository.
- generar URLs firmadas temporales cuando se necesite acceder a un archivo
  privado.

## Flujo Previsto Para Upload

1. Un formulario futuro recibe un archivo.
2. La UI llama a `StorageService.uploadFile`.
3. El service valida tipo, extension y tamano.
4. El service genera un nombre definitivo, sin usar el nombre original como
   nombre final.
5. El service construye una ruta oficial, por ejemplo:

```text
scenarios/thumbnails/{uuid}.jpg
resources/pdf/{uuid}.pdf
```

6. El repository ejecuta la llamada a Supabase Storage.
7. El formulario futuro guarda la ruta interna resultante en la tabla
   correspondiente.

La base de datos debe guardar rutas internas, por ejemplo:

```text
scenarios/thumbnails/{uuid}.jpg
```

No debe guardar URLs firmadas. Las URLs firmadas se generan bajo demanda.

## URLs Firmadas

El bucket `academy-assets` es privado, por lo que no se usan URLs publicas.

El acceso temporal se prepara mediante `createSignedUrl`. La duracion por
defecto es:

```text
300 segundos
```

Esa duracion puede configurarse al solicitar la URL firmada. La URL firmada es
temporal y no debe persistirse en base de datos.

## Decisiones De Arquitectura

- Un solo bucket reduce superficie de RLS y administracion.
- Las rutas internas separan tipos de asset sin crear buckets adicionales.
- El bucket es privado.
- La lectura depende de enrollment activo para alumnos.
- La lectura administrativa depende de `public.admin_users`.
- La escritura depende de `public.admin_users`.
- No existe acceso publico.
- No se guarda HTML ni codigo embed.
- No se implementa Storage en formularios durante esta fase.

## Limites Iniciales

- Thumbnails de modulos: JPG, PNG, WEBP hasta 2 MB.
- Thumbnails de escenarios: JPG, PNG, WEBP hasta 3 MB.
- Imagenes de recursos: JPG, PNG, WEBP hasta 5 MB.
- PDFs: PDF hasta 20 MB.
- Documentos: DOC, DOCX, PDF hasta 20 MB.

Estos limites viven en el service y podran ajustarse antes de conectar UI.
