# Admin UX v1

Esta fase define un pulido visual y de consistencia para el panel
administrativo de Invictus Trading Academy. No agrega capacidades de negocio,
schema, migraciones ni reglas nuevas.

## Patrones Compartidos

- `AdminPageHeader`: encabezado consistente con eyebrow, titulo, descripcion y
  accion primaria opcional.
- `AdminEmptyState`: estado vacio con titulo, explicacion y accion opcional.
- `AdminStatusMessage`: mensaje inline para error, exito, advertencia o
  informacion.
- `AdminLoadingSkeleton`: carga local con dimensiones estables.
- `AdminStatusBadge`: etiqueta visual para estados administrativos.
- `AdminDangerZone`: agrupacion visual de acciones sensibles.

## Jerarquia De Acciones

- Primarias: crear, guardar, publicar o conceder acceso.
- Secundarias: volver, cancelar, editar o cambiar vencimiento.
- Destructivas: eliminar, archivar contenido publicado o revocar acceso.

Las acciones deben declarar `type`, bloquearse durante operaciones y mostrar
texto de carga cuando corresponda.

## Estados

- Loading: skeleton local dentro de la seccion que carga.
- Empty: mensaje accionable que explica que falta y que puede hacer el
  administrador.
- Error: mensaje claro sin exponer detalles tecnicos de Supabase.
- Success: mensaje inline breve, sin sistema global de toasts.

## Formularios

Los formularios mantienen secciones visibles y labels explicitos. Los valores
guardados en base de datos permanecen sin cambios, pero la presentacion de
estados y tipos debe mostrarse en espanol cuando la UI este en espanol.

## Storage

Los campos de subida reutilizan los componentes de Fase 6C.2. El texto de ayuda
incluye formatos esperados y tamano maximo desde `StorageService`. Las previews
privadas usan URL firmada o blob URL solo para mostrar, nunca como valor
persistido.

## Confirmaciones Y Zona De Peligro

Las acciones sensibles se agrupan visualmente y deben explicar que elemento se
afecta. En esta fase no se implementa eliminacion automatica de archivos ni
limpieza de objetos huerfanos.

## Responsive Y Accesibilidad

Los encabezados se apilan en pantallas pequenas, las tablas mantienen scroll
controlado y los estados usan texto ademas de color. Los mensajes de error,
exito y subida usan `aria-live` cuando corresponde.

## Limites

Esta fase no modifica:

- schema de Supabase;
- RLS;
- autenticacion;
- enrollment;
- progreso;
- reglas de publicacion o eliminacion;
- paginas publicas;
- logica de Storage;
- rutas internas del bucket.
