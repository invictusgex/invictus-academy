# Form Engine + Learning Workflow

## Objetivo

La Fase 9.2 agrega un motor reutilizable de formularios academicos para
Invictus Trading Academy. El motor permite definir formularios por producto,
recibir respuestas de estudiantes autenticados y exponer el avance de
formularios requeridos al Learning Workflow.

No implementa Trading Days, Session 101, certificados ni UI de formularios.

## Arquitectura

```text
Client
  |
  | productSlug, formSlug, answers
  v
Route Handler server-side
  |
  | requireServerAuthContext()
  v
FormService
  |
  | valida producto, enrollment activo y formulario publicado
  v
FormRepository
  |
  | academy_form_definitions
  | academy_form_submissions
  v
Supabase
```

El cliente nunca envia `profile_id`, `enrollment_id` ni `product_id`. La ruta
server-side resuelve el `profile` desde la sesion autenticada y el service
resuelve `product`, `enrollment` y `form_definition`.

## Entidades

### FormDefinition

Vive en `academy_form_definitions`.

- Pertenece a un `product`.
- Tiene `slug`, `title`, `description`, `status`, `is_required` y
  `form_schema`.
- Solo los formularios `published` cuentan para lectura del estudiante.
- Solo los formularios `published` e `is_required = true` cuentan para
  `RequiredFormsRule`.

### FormSubmission

Vive en `academy_form_submissions`.

- Pertenece a un `profile`.
- Pertenece a un `enrollment`.
- Pertenece a un `product`.
- Pertenece a una `FormDefinition`.
- Guarda `answers` como JSON de dominio, sin datos sensibles.

La base valida por foreign keys compuestas que el `enrollment`, el `profile`, el
`product` y la definicion de formulario correspondan al mismo alcance.

## Workflow

```text
LearningWorkflowService
  |
  | carga enrollment, modulos, progreso
  | carga RequiredFormsProgress
  v
CompletionRuleEvaluator
  |
  | ModulesCompletedRule
  | RequiredFormsRule
  v
LearningWorkflowEvaluation
```

`ModulesCompletedRule` no fue reescrita. `RequiredFormsRule` se agrega como una
regla adicional y recibe:

- `requiredForms`
- `submittedRequiredForms`
- `enrollmentActive`

El evaluator acepta un arreglo de reglas, por lo que nuevas reglas futuras
pueden agregarse sin hardcodear condiciones dentro del workflow principal.

## Seguridad

- RLS esta habilitado en ambas tablas nuevas.
- `academy_form_definitions` permite lectura autenticada solo de formularios
  publicados asociados a productos con enrollment activo.
- `academy_form_submissions` permite lectura, insert y update solo del propio
  usuario autenticado.
- Las submissions requieren enrollment activo y formulario publicado.
- No hay acceso anonimo.
- No se usa service role.

## Endpoint

`POST /api/academy/forms`

Entrada permitida:

- `productSlug`
- `formSlug`
- `answers`

Campos rechazados:

- `profileId`
- `profile_id`
- `userId`
- `user_id`
- `enrollmentId`
- `enrollment_id`
- `productId`
- `product_id`

## Responsabilidades

`FormRepository` conoce tablas y columnas SQL.

`FormService` valida producto, enrollment, formulario publicado y estructura de
respuesta.

`LearningWorkflowService` consume un resumen de progreso de formularios; no
conoce la estructura interna de las respuestas.

`RequiredFormsRule` decide si la condicion academica de formularios requeridos
esta satisfecha.
