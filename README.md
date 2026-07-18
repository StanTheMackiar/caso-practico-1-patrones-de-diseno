# UES + ICCIS Backend

Aplicacion backend Node.js + Express para administrar facultades, profesores, cursos, estudiantes, proyectos del ICCIS y evaluaciones.

El patron creacional seleccionado es **Factory Method**. La creacion de entidades se centraliza en `src/factories/entity.factory.js`, donde cada tipo de entidad tiene su metodo creador y el resto de la aplicacion no instancia objetos manualmente.

Tambien se implementa el patron estructural **Adapter** en `src/adapters/store.adapter.js`. La aplicacion trabaja con colecciones y propiedades en formato JavaScript, mientras `src/store/database.store.js` simula una base de datos con tablas y campos en formato `snake_case`.

El flujo del adaptador es sencillo:

1. El servicio solicita o guarda una entidad usando la interfaz habitual.
2. El adaptador traduce el nombre de la coleccion al nombre de la tabla.
3. Al guardar, convierte propiedades como `facultyId` a `faculty_id`.
4. Al consultar, convierte los registros nuevamente al formato que entiende el sistema.

Para la tercera parte de la activida se implementa el patrón de comportamiento **Observer**. Cuando se crea una evaluación, el servicio publica el evento mediante `EvaluationSubject` y los observadores suscritos reaccionan sin que el servicio tenga que conocer la lógica interna de cada uno.

Los participantes del patrón son:

- **Sujeto:** `src/observers/evaluation.subject.js`. Permite suscribir, retirar y notificar observadores.
- **Observador de estado:** `src/observers/project-status.observer.js`. Recalcula el promedio y cambia el estado del proyecto.
- **Observador de auditoría:** `src/observers/evaluation-audit.observer.js`. Registra en consola la evaluación creada.

El flujo de Observer es síncrono:

1. El servicio valida y guarda la evaluación mediante Factory Method y Adapter.
2. El sujeto notifica la evaluación a todos los observadores suscritos.
3. Cada observador ejecuta su responsabilidad mediante el método `update`.
4. La API responde cuando todos los observadores han terminado.

Observer no requiere una librería ni significa que el proceso se ejecute en segundo plano. En este caso se implementó manualmente para mostrar claramente el patrón y garantizar que el proyecto quede actualizado antes de responder al cliente.

Tambien se agregó un patrón de arquitectura tipo **MVC**:

- **Modelo:** `src/store/database.store.js`, `src/adapters/store.adapter.js`, `src/services/ues.service.js` y `src/factories/entity.factory.js`. Mantienen datos, adaptacion, reglas de negocio y creacion de entidades.
- **Vista:** al ser una API REST, la vista es la respuesta JSON enviada al cliente.
- **Controlador:** `src/controllers/ues.controller.js`. Recibe `req`, llama al servicio correspondiente y responde con JSON.
- **Rutas:** `src/routes/routes.js`. Solo declara endpoints y delega al controlador.

## Instalacion y ejecucion

```bash
npm install
npm start
```

Servidor por defecto:

```text
http://localhost:3000
```

## Endpoints principales

- `GET /api`: resumen de la API.
- `GET /api/faculties`, `GET /api/professors`, `GET /api/courses`, `GET /api/students`, `GET /api/projects`, `GET /api/evaluations`: listar datos.
- `POST /api/faculties`: crear facultad.
- `POST /api/professors`: crear profesor.
- `POST /api/courses`: crear curso asociado a facultad y profesor.
- `POST /api/projects`: crear proyecto ICCIS asociado a un curso. El profesor se toma del curso y solo puede tener un proyecto.
- `POST /api/students`: crear estudiante. Debe indicar pais suramericano y participar en al menos un proyecto.
- `POST /api/courses/:courseId/students`: inscribir estudiante en curso.
- `POST /api/projects/:projectId/students`: asociar estudiante a proyecto.
- `POST /api/evaluations`: registrar calificacion individual de un estudiante en un proyecto.
- `GET /api/report`: ver totales, proyectos cerrados e inconsistencias simples.

## Interfaz de endpoints con datos

Todos los endpoints `POST` reciben informacion en formato JSON y deben enviarse con el header:

```http
Content-Type: application/json
```

### Crear facultad

`POST /api/faculties`

Campos:

- `name` string, obligatorio. Nombre de la facultad.
- `description` string, opcional. Descripcion general.

Ejemplo:

```json
{
  "name": "Facultad de Ingenieria",
  "description": "Programas tecnologicos y profesionales"
}
```

Respuesta exitosa: `201 Created` con la facultad creada.

### Crear profesor

`POST /api/professors`

Campos:

- `name` string, obligatorio. Nombre del profesor.
- `email` string, obligatorio. Correo del profesor.
- `facultyId` string, obligatorio. ID de una facultad existente.

Ejemplo:

```json
{
  "name": "Carlos Rojas",
  "email": "carlos.rojas@ues.edu",
  "facultyId": "fac_12345678"
}
```

Reglas:

- `facultyId` debe existir.
- El profesor se crea inicialmente sin proyecto, con `projectId: null`.

Respuesta exitosa: `201 Created` con el profesor creado.

### Crear curso

`POST /api/courses`

Campos:

- `name` string, obligatorio. Nombre del curso.
- `facultyId` string, obligatorio. ID de una facultad existente.
- `professorId` string, obligatorio. ID de un profesor existente.

Ejemplo:

```json
{
  "name": "Investigacion Aplicada I",
  "facultyId": "fac_12345678",
  "professorId": "pro_12345678"
}
```

Reglas:

- `facultyId` debe existir.
- `professorId` debe existir.
- Un profesor puede tener varios cursos.

Respuesta exitosa: `201 Created` con el curso creado.

### Crear proyecto ICCIS

`POST /api/projects`

Campos:

- `name` string, obligatorio. Nombre del proyecto.
- `description` string, opcional. Descripcion del proyecto.
- `courseId` string, obligatorio. ID de un curso existente.

Ejemplo:

```json
{
  "name": "Estudio de plantas amazonicas",
  "description": "Proyecto de investigacion del ICCIS",
  "courseId": "cou_12345678"
}
```

Reglas:

- `courseId` debe existir.
- El profesor responsable se toma automaticamente desde el curso.
- Cada profesor solo puede tener un proyecto ICCIS asociado.
- El proyecto inicia con `evaluationScore: 100` y `status: "active"`.

Respuesta exitosa: `201 Created` con el proyecto creado.

### Crear estudiante

`POST /api/students`

Campos:

- `name` string, obligatorio. Nombre del estudiante.
- `email` string, obligatorio. Correo del estudiante.
- `country` string, obligatorio. Pais de origen del estudiante.
- `courseIds` array de strings, opcional. IDs de cursos existentes.
- `projectIds` array de strings, obligatorio. IDs de proyectos existentes.

Ejemplo:

```json
{
  "name": "Mariana Perez",
  "email": "mariana.perez@ues.edu",
  "country": "Colombia",
  "courseIds": ["cou_12345678"],
  "projectIds": ["prj_12345678"]
}
```

Reglas:

- `country` debe ser uno de estos valores: `Argentina`, `Bolivia`, `Brasil`, `Chile`, `Colombia`, `Ecuador`, `Paraguay`, `Peru`, `Uruguay`, `Venezuela`.
- `projectIds` debe tener al menos un proyecto.
- Todos los IDs enviados en `courseIds` deben existir.
- Todos los IDs enviados en `projectIds` deben existir.
- Al crear el estudiante, tambien queda inscrito en los cursos y proyectos enviados.

Respuesta exitosa: `201 Created` con el estudiante creado.

### Inscribir estudiante en curso

`POST /api/courses/:courseId/students`

Parametros de ruta:

- `courseId` string, obligatorio. ID del curso.

Campos:

- `studentId` string, obligatorio. ID de un estudiante existente.

Ejemplo:

```json
{
  "studentId": "stu_12345678"
}
```

Reglas:

- `courseId` debe existir.
- `studentId` debe existir.
- Si el estudiante ya estaba inscrito, no se duplica.

Respuesta exitosa: `200 OK` con el curso actualizado.

### Asociar estudiante a proyecto

`POST /api/projects/:projectId/students`

Parametros de ruta:

- `projectId` string, obligatorio. ID del proyecto.

Campos:

- `studentId` string, obligatorio. ID de un estudiante existente.

Ejemplo:

```json
{
  "studentId": "stu_12345678"
}
```

Reglas:

- `projectId` debe existir.
- `studentId` debe existir.
- Si el estudiante ya estaba asociado, no se duplica.

Respuesta exitosa: `200 OK` con el proyecto actualizado.

### Crear evaluacion

`POST /api/evaluations`

Campos:

- `studentId` string, obligatorio. ID de un estudiante existente.
- `projectId` string, obligatorio. ID de un proyecto existente.
- `score` number, obligatorio. Calificacion entre `0` y `100`.
- `comments` string, opcional. Observacion de la evaluacion.

Ejemplo:

```json
{
  "studentId": "stu_12345678",
  "projectId": "prj_12345678",
  "score": 65,
  "comments": "Debe mejorar la entrega"
}
```

Reglas:

- `studentId` debe existir.
- `projectId` debe existir.
- El estudiante debe participar en el proyecto.
- `score` debe estar entre `0` y `100`.
- Despues de crear la evaluacion, el sujeto notifica a los observadores y se recalcula el promedio del proyecto.
- Si el 50% o mas de las evaluaciones del proyecto son menores a `70`, el proyecto queda con `status: "closed"`.

Respuesta exitosa: `201 Created` con la evaluacion creada.

### Respuesta de error

Cuando una regla no se cumple, la API responde `400 Bad Request` con esta estructura:

```json
{
  "error": "Mensaje descriptivo del error"
}
```

## Ejemplos de uso

Listar datos iniciales:

```bash
curl http://localhost:3000/api
curl http://localhost:3000/api/projects
```

Crear una evaluacion:

```bash
curl -X POST http://localhost:3000/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{"studentId":"ID_ESTUDIANTE","projectId":"ID_PROYECTO","score":65,"comments":"Debe mejorar la entrega"}'
```

Regla del proyecto: cuando el 50% o mas de sus evaluaciones estan por debajo de 70 puntos, el proyecto cambia su estado a `closed`. La evaluacion general del proyecto se calcula como promedio de las notas recibidas.
