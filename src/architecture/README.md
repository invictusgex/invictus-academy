# Arquitectura tecnica de Invictus Trading Academy

Este documento prepara la siguiente etapa del proyecto para autenticacion,
base de datos y pagos sin implementar todavia esas integraciones. La intencion
es definir limites claros antes de reemplazar persistencia local, proteger el
acceso al programa y conectar un flujo comercial real.

## Vision general del sistema

Invictus Trading Academy sera una plataforma educativa con experiencia publica,
registro de estudiantes, acceso controlado al programa, seguimiento de progreso
y area administrativa. La arquitectura debe permitir comenzar con costos bajos,
pero sin acoplar la UI a una tecnologia especifica de base de datos, pagos o
autenticacion.

La aplicacion se divide conceptualmente en:

- Capa publica: landing, programa publico y oferta.
- Capa privada de estudiante: programa adquirido, lecciones, recursos y progreso.
- Capa administrativa: gestion futura de productos, inscripciones, compras,
  usuarios y contenido.
- Capa de dominio: reglas de acceso, progreso, disponibilidad y estado comercial.
- Capa de infraestructura: autenticacion, persistencia, pagos y servicios externos.

## Arquitectura general

```text
+-----------------------------+
| UI publica y privada        |
| pages, layouts, components  |
+--------------+--------------+
               |
               v
+-----------------------------+
| Hooks                       |
| estado de pantalla y casos  |
| de uso consumidos por UI    |
+--------------+--------------+
               |
               v
+-----------------------------+
| Repositories                |
| contratos de lectura y      |
| escritura del dominio       |
+--------------+--------------+
               |
               v
+-----------------------------+
| Services                    |
| autenticacion, pagos,       |
| progreso, permisos          |
+--------------+--------------+
               |
               v
+-----------------------------+
| Database / proveedores      |
| Supabase futuro, checkout,  |
| storage, webhooks           |
+-----------------------------+
```

## Flujo del usuario

1. El visitante entra a la experiencia publica.
2. Revisa la oferta, el programa y la metodologia.
3. Inicia registro o compra cuando esos flujos existan.
4. El sistema crea o identifica al usuario autenticado.
5. El sistema registra la compra y crea una inscripcion.
6. El estudiante entra al programa privado si tiene permisos.
7. El estudiante consume lecciones y recursos.
8. El progreso se guarda en persistencia remota.
9. El area administrativa revisa usuarios, compras, inscripciones y avance.

## Separacion entre frontend y backend

El frontend no debe conocer detalles de tablas, proveedores de pago ni sesiones
internas. Los componentes deben renderizar datos y disparar acciones de alto
nivel. Los hooks deben coordinar estados de UI y llamar casos de uso. Los
repositories deben exponer contratos estables. Los services deben contener reglas
de negocio o integracion. La base de datos queda detras de una capa reemplazable.

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

## Responsabilidades por capa

### UI

- Mostrar pantallas publicas y privadas.
- Renderizar estados de carga, error, vacio y exito.
- No consultar directamente base de datos.
- No contener reglas de permisos ni calculos centrales de progreso.
- No conocer detalles del proveedor de pagos.

### Hooks

- Conectar componentes con casos de uso.
- Preparar datos para la pantalla.
- Coordinar estados temporales de interaccion.
- Exponer acciones como `startPurchase`, `markLessonCompleted` o `loadProgram`.

### Repositories

- Definir contratos de acceso a datos.
- Traducir entidades de infraestructura a entidades del dominio.
- Permitir reemplazar localStorage por base de datos sin reescribir componentes.
- Aislar consultas, filtros y escrituras persistentes.

### Services

- Aplicar reglas de negocio.
- Validar permisos antes de entregar contenido privado.
- Coordinar autenticacion, compras, inscripciones y progreso.
- Procesar eventos futuros como webhooks de pago.

### Database

- Persistir usuarios, productos, compras, inscripciones, contenido y progreso.
- Mantener relaciones y restricciones.
- No ser llamada directamente por componentes.

## Entidades conceptuales

No se crean tablas reales en esta etapa. Estas entidades son contratos de dominio
para guiar la implementacion futura.

### User

Representa una persona registrada o administradora.

- `id`
- `email`
- `name`
- `role`
- `createdAt`
- `updatedAt`

### Product

Representa una oferta comercial que puede comprarse.

- `id`
- `slug`
- `title`
- `description`
- `price`
- `currency`
- `status`

### Enrollment

Representa el acceso concedido de un usuario a un producto o programa.

- `id`
- `userId`
- `productId`
- `purchaseId`
- `status`
- `startsAt`
- `endsAt`

### Purchase

Representa una transaccion comercial o intento de compra.

- `id`
- `userId`
- `productId`
- `provider`
- `providerSessionId`
- `amount`
- `currency`
- `status`
- `createdAt`

### Module

Representa una unidad principal del programa.

- `id`
- `slug`
- `title`
- `description`
- `order`
- `status`

### Lesson

Representa una clase o video dentro de un modulo.

- `id`
- `moduleId`
- `title`
- `description`
- `videoProvider`
- `videoRef`
- `order`
- `status`

### Resource

Representa material complementario asociado a una leccion o modulo.

- `id`
- `moduleId`
- `lessonId`
- `title`
- `type`
- `url`
- `status`

### Progress

Representa avance del estudiante dentro del programa.

- `id`
- `userId`
- `moduleId`
- `lessonId`
- `status`
- `completedAt`
- `updatedAt`

## Relaciones entre entidades

```text
User 1 ---- * Purchase
User 1 ---- * Enrollment
User 1 ---- * Progress

Product 1 ---- * Purchase
Product 1 ---- * Enrollment

Enrollment * ---- 1 User
Enrollment * ---- 1 Product
Enrollment * ---- 0..1 Purchase

Module 1 ---- * Lesson
Module 1 ---- * Resource
Lesson 1 ---- * Resource
Lesson 1 ---- * Progress
```

## Estrategia para reemplazar localStorage por persistencia

La persistencia local debe tratarse como una implementacion temporal. El objetivo
futuro es mover progreso, sesion y permisos a servicios persistentes.

Plan recomendado:

1. Mantener la UI consumiendo hooks existentes o equivalentes.
2. Introducir repositories con la misma forma de datos que ya espera la UI.
3. Crear una implementacion temporal basada en localStorage solo si hace falta.
4. Crear una implementacion remota futura basada en base de datos.
5. Cambiar la implementacion del repository sin cambiar componentes.
6. Migrar datos locales solamente si existe una necesidad real de continuidad.

## Flujo futuro de autenticacion

```text
Visitante
   |
   v
Formulario de registro/login
   |
   v
Auth Service
   |
   v
Proveedor de autenticacion futuro
   |
   v
Sesion autenticada
   |
   v
User Repository
   |
   v
Perfil de usuario
```

Reglas previstas:

- La UI solo conoce si hay usuario, si carga o si existe error.
- El Auth Service maneja proveedor, sesion y renovacion.
- El progreso no depende directamente del mecanismo de login.
- Los permisos se calculan por inscripcion activa, no solo por usuario logueado.

## Flujo futuro de compra

```text
Usuario o visitante
   |
   v
CTA publico
   |
   v
Purchase Service
   |
   v
Proveedor de pagos futuro
   |
   v
Checkout externo
   |
   v
Webhook de pago
   |
   v
Purchase Repository
   |
   v
Enrollment Service
   |
   v
Acceso concedido
```

Reglas previstas:

- Product define que se vende.
- Purchase registra el evento comercial.
- Enrollment define acceso al programa.
- Una compra exitosa puede crear o activar una inscripcion.
- Productos y compras no deben mezclarse con contenido educativo.

## Flujo futuro de acceso al programa

```text
Usuario autenticado
   |
   v
Solicita /academy/programa
   |
   v
Access Service
   |
   v
Enrollment Repository
   |
   v
Tiene inscripcion activa?
   |
   +-- no --> pantalla publica o acceso denegado
   |
   +-- si --> Program Repository
              |
              v
           Contenido privado
```

## Flujo de progreso

```text
Estudiante
   |
   v
Marca leccion como completada
   |
   v
Progress Hook
   |
   v
Progress Service
   |
   v
Access Service valida inscripcion
   |
   v
Progress Repository
   |
   v
Database
```

Reglas previstas:

- El progreso pertenece a un usuario.
- El progreso se asocia a lecciones y modulos.
- El calculo agregado de porcentaje debe vivir fuera de componentes.
- La UI no decide si un progreso es valido; solo solicita cambios.

## Flujo de permisos

```text
Request de contenido privado
   |
   v
Usuario autenticado?
   |
   +-- no --> requerir login
   |
   +-- si
       |
       v
   Enrollment activa?
       |
       +-- no --> mostrar oferta o acceso denegado
       |
       +-- si
           |
           v
       Recurso disponible?
           |
           +-- no --> mostrar no disponible
           |
           +-- si --> entregar contenido
```

## Decisiones arquitectonicas

### No consultar la base de datos directamente desde componentes

Los componentes deben ser faciles de leer, probar y reemplazar. Si consultan la
base de datos directamente, la UI queda atada a un proveedor especifico y las
reglas de acceso se dispersan por la aplicacion. Al usar hooks, repositories y
services, el proyecto puede cambiar de persistencia o proveedor sin redisenar
cada pantalla.

### Progreso y autenticacion estaran desacoplados

La autenticacion responde quien es el usuario. El progreso responde que avance
tiene ese usuario dentro del programa. Mantenerlos separados evita que cambios
en login, sesiones o proveedor de auth rompan la logica educativa. El progreso
debe depender de `userId` y permisos validados, no de detalles internos de la
sesion.

### Productos y compras seran independientes

Product define la oferta comercial. Purchase registra una transaccion o intento
de pago. Separarlos permite cambiar precios, crear promociones, manejar pagos
fallidos, reembolsos o nuevos productos sin alterar el contenido del programa.
El acceso real vive en Enrollment, que conecta usuario y producto despues de una
compra valida.

## Notas para la siguiente etapa

- No integrar Supabase hasta definir contratos concretos de repositories.
- No instalar SDKs de pagos hasta elegir proveedor y flujo.
- No mover progreso a base de datos sin una capa de compatibilidad.
- No exponer videos privados solo por ocultarlos en la UI; el acceso debe
  validarse desde services y backend.
