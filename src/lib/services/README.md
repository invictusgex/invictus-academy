# Services

Esta carpeta alojara reglas de negocio y coordinacion entre capas.

## Proposito

Separar decisiones del dominio de la UI y de la persistencia. Los services
permiten modelar flujos como acceso, compra, progreso y autenticacion sin
contaminar componentes.

## Responsabilidades

- Validar permisos de acceso.
- Coordinar auth, compras, inscripciones y progreso.
- Preparar flujos futuros de checkout y webhooks.
- Calcular estados derivados del dominio.
- Proteger reglas que no deben repetirse en componentes.

## Que tipos de archivos viviran aqui

- `access.service.ts`
- `purchase.service.ts`
- `enrollment.service.ts`
- `progress.service.ts`
- `program.service.ts`
- `auth.service.ts` si se decide centralizarlo aqui.

## Que NO debe vivir aqui

- Componentes React.
- Estilos.
- Consultas crudas dispersas.
- Credenciales.
- Logica puramente visual.

## Relacion con otras capas

Los services son usados por hooks o repositories segun el caso. Pueden coordinar
varios repositories y usar adaptadores de infraestructura, pero deben mantener
una interfaz estable para el resto de la aplicacion.

## EnrollmentService

`enrollment.service.ts` prepara la capa de autorizacion para acceso al programa.
Todavia no consulta la tabla `enrollments` ni protege rutas. Su responsabilidad
futura sera coordinar la pregunta de acceso con el repository correspondiente.

Conceptos:

- Authentication: valida identidad y sesion.
- Authorization: valida permisos de acceso.
- Enrollment: evidencia de que el usuario tiene acceso a un producto.

```text
Usuario autenticado
  !=
Usuario con acceso al programa
```

Esta separacion evita que una sesion activa abra contenido privado sin una
inscripcion activa.
