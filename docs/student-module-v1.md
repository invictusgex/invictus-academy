# Student Module v1

Esta subfase convierte `/academy/programa/[moduleId]` en una experiencia de
detalle del modulo para el alumno. No modifica auth, enrollment, progreso
persistido, Supabase, queries, repositories, services ni Storage.

## Estructura

La pagina sigue esta jerarquia:

1. Header del modulo.
2. Videos.
3. Recursos.
4. Objetivos del modulo.
5. Navegacion.

No se agregan secciones adicionales ni rutas nuevas.

## Flujo De Datos

El Server Component mantiene las cargas existentes:

- `getAcademyProgram()`;
- `getAcademyModule(moduleId)`;
- `notFound()` cuando el modulo no existe.

El contenedor cliente recibe los datos ya cargados, lee el estado actual desde
`ProgressContext` y resuelve assets privados con `StorageService.resolveAssetUrl`
mediante hooks locales.

## Header

El header muestra:

- numero del modulo;
- titulo;
- descripcion;
- estado visible;
- miniatura;
- CTA hacia la seccion de videos cuando existen videos.

El estado usa `StudentStatusBadge` y no recalcula progreso.

## Videos

Los videos se presentan como contenido dentro del mismo modulo:

- `Video 1`;
- `Video 2`, cuando exista.

No se crean sesiones academicas, no se agrega navegacion independiente por video
y el Modulo 4 sigue siendo una sola unidad de progreso aunque tenga dos videos.

## Recursos

Los recursos se muestran como tarjetas con:

- nombre;
- descripcion;
- tipo real;
- accion disponible.

Las acciones usan URL externa segura o signed URL resuelta desde `storagePath`.
Si no existe URL disponible, se muestra un estado discreto.

## Objetivos

Los objetivos del modulo se presentan como tarjetas numeradas de formacion, sin
modificar el contenido original.

## Navegacion

La navegacion usa el orden academico existente y permite:

- modulo anterior;
- volver al programa;
- siguiente modulo.

No hay bloqueo, prerequisitos ni candados.

## Miniaturas Y Storage

Las miniaturas internas y recursos privados se resuelven bajo demanda con
`StorageService.resolveAssetUrl`. No se usa la API publica de Supabase para
resolver archivos privados, no se guardan signed URLs y no se envia una ruta
interna directamente al navegador.

## Responsive Y Accesibilidad

- Desktop: header amplio, videos y recursos escaneables.
- Tablet: tarjetas con ancho suficiente.
- Mobile: stack vertical, CTAs tactiles y sin scroll horizontal.
- La pagina mantiene un solo `h1`.
- Los enlaces tienen foco visible.
- No hay enlaces anidados ni botones dentro de enlaces.

## Limites

No se implementa:

- tracking nuevo;
- comentarios;
- notas;
- certificados;
- favoritos;
- progreso por video;
- Stripe;
- analiticas;
- IA;
- busqueda;
- bloqueo;
- gamificacion.
