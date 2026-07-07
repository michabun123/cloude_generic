# testPrepSmallHello

Industrial-grade **polyglot-persistence** Spring Boot microservice using **PostgreSQL (JPA)** and
**MongoDB (document store)** side by side.

- **Base package:** `com.interview.prep`
- **Java:** 21 · **Spring Boot:** 3.3.5 · **Port:** 8080

---

## Polyglot persistence — what lives where & why

| Store | Module | Resource | Package | Rationale |
|-------|--------|----------|---------|-----------|
| **PostgreSQL / H2** | Spring Data **JPA** | `SmallItem` (structured inventory row with uniqueness, versioning, timestamps) | `domain.jpa`, `repository.jpa` | Relational data with strong constraints, transactions and a fixed schema owned by Flyway. |
| **MongoDB** | Spring Data **MongoDB** | `SmallTest` (flexible person document) | `domain.mongo`, `repository.mongo` | Flexible schema — typed core fields plus an `attributes` catch-all `Map<String,Object>` for arbitrary per-document extras. |

Each store has its **own** Spring Data module, repositories and domain package. There is no
cross-store transaction; each service is responsible for its own consistency.

### SQL profiles
- **Default (no profile):** in-memory **H2** (`MODE=LEGACY`), so the service boots out-of-the-box
  with no external SQL DB. H2 console at `/h2-console`.
- **`postgres` profile:** real PostgreSQL at `localhost:5432/testSmall`, **named schema** `test_small`,
  DDL owned by **Flyway** (`ddl-auto: validate`).

### MongoDB (all profiles)
MongoDB has no in-memory equivalent, so it connects to the local server in **every** profile
(`mongodb://smallT:smallT@localhost:27017/smallTest?authSource=admin`). Tests use **embedded**
(flapdoodle) Mongo via `@DataMongoTest`.

---

## Run

### Default (H2 + local Mongo)
```
mvn spring-boot:run
```
Then:
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health
- H2 console: http://localhost:8080/h2-console

### PostgreSQL profile
```
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```
> **DataGrip:** the PostgreSQL data lives in the **named schema `test_small`** of database
> **`testSmall`**. In DataGrip open *Database → testSmall → Schemas* and **tick `test_small`**
> (Schemas… → check it) so the migrated tables become visible.

### IntelliJ
A shareable Maven run config is provided at `.run/testPrepSmallHello.run.xml`
(goal `spring-boot:run`, workingDir `$PROJECT_DIR$`) — runnable immediately on import.

---

## Database bootstrap (local, idempotent)

- **PostgreSQL** — `db/bootstrap/00_create_role_and_db.sql` creates a **dedicated** role `tsm`,
  database `testSmall`, schema `test_small` and grants:
  ```
  psql -U postgres -f db/bootstrap/00_create_role_and_db.sql
  ```
- **MongoDB** — `db/bootstrap/01_create_mongo_user.js` creates the **dedicated** service user `smallT`:
  ```
  mongosh "mongodb://admin:admin123@localhost:27017/admin?authSource=admin" db/bootstrap/01_create_mongo_user.js
  ```

The Mongo collection `smallTest` is seeded with **6 sample documents** on first startup
(`MongoSeeder`, skipped under the `test` profile).

---

## REST API

### `SmallItem` (relational) — `/api/v1/small-items`
| Method | Path | Result |
|--------|------|--------|
| GET | `/` | list |
| GET | `/{id}` | one (404 if unknown) |
| POST | `/` | **201** + envelope |
| PUT | `/{id}` | 200 + envelope |
| DELETE | `/{id}` | **200** + envelope-with-deleted |

### `SmallTest` (Mongo, flexible) — `/api/v1/small-tests`
Same CRUD shape. Body carries typed fields **plus** an `attributes` map:
```json
{ "name": "Ann", "familyName": "Lee", "email": "ann@x.com", "phone": "123",
  "attributes": { "department": "eng", "level": 3 } }
```

Envelopes: mutating endpoints return `{ "message", "data", "timestamp" }`. Errors return
`{ "status", "error", "message", "path", "fieldErrors", "timestamp" }`.

---

## Architecture decisions
- **Layering:** `controller → service → repository → domain`, DTOs as **records**, entities via
  **Lombok** (records can't be JPA entities). **Constructor injection** everywhere (`@RequiredArgsConstructor`).
- **Exceptions:** custom exceptions + `@RestControllerAdvice` live in `com.interview.prep.exception`
  (never a `web` package). `NoResourceFoundException` (favicon etc.) is special-cased to a **quiet 404**
  with no stack-trace ERROR — the catch-all `Exception` handler never logs it as 500.
- **Transactions:** `@Transactional(rollbackFor = Exception.class)` on JPA mutations.
- **Validation:** Jakarta Bean Validation on request records → 400 with per-field messages.
- **Observability:** Actuator health + liveness/readiness probes, OpenAPI/Swagger.
- **Testing (pyramid):** unit (mocked services) → slice (`@DataJpaTest` H2, `@DataMongoTest` embedded)
  + web (`@WebMvcTest`) → context smoke test.

## Docker & Kubernetes
- `Dockerfile` — multi-stage, non-root runtime.
- `k8s/` — Deployment (2 replicas, resource requests/limits, liveness/readiness/startup probes) + ClusterIP Service.
