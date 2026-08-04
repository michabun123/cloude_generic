# Kotlin Task Service

A small, production-shaped REST API built with **Kotlin + Ktor (Netty)** and
`kotlinx.serialization`. In-memory storage behind a repository interface so it
can be swapped for a database without touching the routing layer.

## Requirements
- JDK 17+
- Maven 3.9+

## Build & test
```
mvn clean package
```
Runs the compiler, the 6 Ktor `testApplication` integration tests, and produces
a runnable fat jar at `target/kotlin-task-service-1.0.0.jar`.

## Run
```
java -jar target/kotlin-task-service-1.0.0.jar
```
Server listens on `http://localhost:8080`.

## API
| Method | Path          | Body                                  | Result                |
|--------|---------------|---------------------------------------|-----------------------|
| GET    | `/health`     | —                                     | `{"status":"UP"}`     |
| GET    | `/tasks`      | —                                     | array of tasks        |
| GET    | `/tasks/{id}` | —                                     | task or 404           |
| POST   | `/tasks`      | `{"title","description"}`             | 201 created task      |
| PUT    | `/tasks/{id}` | `{"title?","description?","status?"}` | updated task or 404   |
| DELETE | `/tasks/{id}` | —                                     | 204 or 404            |

`status` ∈ `TODO | IN_PROGRESS | DONE`.

### Example
```
curl -X POST http://localhost:8080/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship it","description":"deploy"}'

curl -X PUT http://localhost:8080/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE"}'
```

## Design notes
- **Layering**: `Model` (DTOs) → `TaskRepository` (storage) → `Routing` (HTTP) →
  `Application` (wiring/plugins). `module()` takes a repository parameter so tests
  inject a fresh `InMemoryTaskRepository`.
- **Concurrency**: repository uses `ConcurrentHashMap` + `AtomicLong` and atomic
  `computeIfPresent` for lock-free updates.
- **Error handling**: `StatusPages` maps `ValidationException` → 400 and any other
  throwable → 500 with a JSON `ErrorResponse`.
