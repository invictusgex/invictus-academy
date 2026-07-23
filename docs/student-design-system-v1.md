# Student Design System v1

Esta foundation prepara el sistema visual reutilizable del area privada del
alumno de Invictus Trading Academy. No implementa dashboard definitivo,
estadisticas reales, pagos, certificados, perfil, notificaciones ni nuevas
consultas.

## Jerarquia Visual

La composicion base del area privada sigue este orden:

1. Hero
2. Resumen
3. Contenido principal
4. Contenido secundario
5. Acciones

El objetivo es que cada pantalla del alumno tenga una lectura clara: primero
contexto, luego estado, despues tareas disponibles.

## Componentes

- `StudentWelcomeHero`: saludo, nombre, descripcion, CTA, badge e imagen
  decorativa opcional.
- `StudentPageHeader`: encabezado secundario para paginas internas.
- `StudentSection`: seccion con titulo, descripcion, acciones y contenido.
- `StudentCard`: contenedor base para curso, escenario, recurso o bloque de
  informacion.
- `StudentStatCard`: tarjeta de estadistica futura, sin conectar datos reales.
- `StudentActionCard`: acceso rapido con CTA.
- `StudentContentGrid`: grid responsive de 2, 3 o 4 columnas.
- `StudentEmptyState`: estado vacio reutilizable.
- `StudentLoadingSkeleton`: skeleton local sin spinner grande.
- `StudentStatusBadge`: badges para estados como Nuevo, Publicado, En progreso,
  Completado o Proximamente.

## Tipografia

- Titulos de pagina: `text-3xl` a `text-5xl` segun jerarquia.
- Titulos de seccion: `text-2xl`.
- Titulos de card: `text-xl`.
- Descripciones: `text-sm` o `text-base` con `leading-6` o `leading-7`.
- Captions y eyebrow: uppercase con tracking amplio.

## Espaciado

- Separacion entre bloques principales: `space-y-6`.
- Secciones: `p-5 sm:p-7 lg:p-8`.
- Cards: `p-5 sm:p-6`.
- Grids: `gap-4`.

## Responsive

- Mobile: stack vertical por defecto.
- Tablet: grids de 2 columnas cuando existe densidad suficiente.
- Desktop: grids de 3 o 4 columnas segun tipo de contenido.
- CTAs principales ocupan ancho completo en mobile y ancho natural en desktop.

## Accesibilidad

- Headings mantienen jerarquia semantica.
- Links y botones usan foco visible.
- Skeletons declaran `role="status"` y texto `sr-only`.
- Badges no deben ser la unica forma de comunicar informacion critica.
- Contraste se apoya en los tokens oscuros existentes del proyecto.

## Refinamiento Visual Fase 7.2

- `StudentCard` incorpora transicion sutil de borde y elevacion moderada cuando
  `elevated` esta activo.
- `StudentSection` alinea mejor acciones secundarias y permite CTA full-width en
  mobile.
- `StudentActionCard` mantiene altura consistente y empuja el CTA al final.
- `StudentEmptyState` usa un separador discreto y CTA responsive para integrarse
  con el dashboard.
- Las microinteracciones son ligeras, no continuas y respetan
  `motion-reduce`.

## Tokens Reutilizados

Se reutilizan los tokens globales existentes:

- `--color-page-bg`
- `--color-panel-bg`
- `--color-card-bg`
- `--color-border`
- `--color-cyan`
- `--color-cyan-hover`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-text-muted`

## Limites De La Fase

Esta fase no modifica:

- Supabase;
- autenticacion;
- enrollment;
- progreso;
- repositories;
- services;
- server actions;
- rutas publicas;
- reglas de acceso.

Los componentes quedan disponibles para conectar el dashboard definitivo en una
fase posterior.
