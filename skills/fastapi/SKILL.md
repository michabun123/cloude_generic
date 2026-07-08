---
name: fastapi
description: Authority skill for building production-grade Python microservices and apps with FastAPI. The Python peer to the spring-boot skill. Use for any FastAPI / Python-backend build. Defines the conventions (Pydantic, SQLAlchemy+Alembic, dependency injection, pytest, OpenAPI). NEVER overrides the spring-boot skill and is never used for Java work.
---

# FastAPI (Python microservice authority)

Authority for **Python / FastAPI** builds — the analog of `spring-boot` for Java. Applies only to Python; **never touches or overrides spring-boot** (see [[engineering-team]]). Produce industrial-grade, runnable, verified services.

## Stack (defaults)
- **FastAPI** + **Uvicorn** (ASGI), Python 3.12
- **Pydantic v2** models (request/response + validation) — the DTO/record analog
- **SQLAlchemy 2.0** ORM + **Alembic** migrations (the JPA + Flyway analog)
- **Motor / Beanie** for MongoDB (async) when a document store is used
- **pytest** + **httpx** `TestClient` for tests
- **Poetry** (or `pip` + `requirements.txt`) for deps
- Auto **OpenAPI/Swagger** at `/docs` (built in), `/redoc`, health via a `/health` route or starlette-exporter

## Conventions (mirror the spring-boot rigor)
- **Package layout:** `app/` → `main.py`, `api/` (routers = controllers), `services/`, `repositories/`, `models/` (SQLAlchemy), `schemas/` (Pydantic), `core/` (config, deps), `exceptions/`.
- **Dependency injection** via `Depends()` (constructor-injection analog) — no globals.
- **Config** via `pydantic-settings` `BaseSettings` (env-driven; `.env` for local) — the `@ConfigurationProperties` analog. Never hardcode secrets.
- **Validation** in Pydantic schemas (`Field(gt=0)`, `EmailStr`, etc.) — the Bean Validation analog.
- **Exceptions:** custom exception classes + a central **exception handler** (`@app.exception_handler`) mapping to clean JSON + status (the `@RestControllerAdvice` analog). 404/400/409 for not-found/validation/conflict.
- **CRUD by default** per resource (GET list, GET by id, POST 201+envelope, PUT, DELETE 200+envelope) plus any extra endpoints specified. Envelope: `{ "success": true, "message": "...", "data": {...} }` for POST/DELETE.
- **Entity + schema per table**; field types inferred from names unless given in parens.
- **Async** endpoints + async DB session; `@transactional`-style via an async session + explicit commit/rollback in the service.
- **Local infra (same as Java builds):** PostgreSQL 18 (`localhost:5432`, pgpass admin `postgres/admin`), MongoDB 8.2 (`localhost:27017`, admin `admin/admin123`), Kafka `localhost:9092` (`C:\kafka`). Auto-bootstrap a **dedicated** DB role/user per service during build-verify (mirror the pg/mongo bootstrap). Default schema = **public** for Postgres (no named-schema DataGrip trap).
- **Mongo flexible schema:** document models carry a typed core + an `attributes: dict[str, Any]` catch-all.

## Build-verify loop (mandatory — mirror the Java one)
1. `python -m venv` / poetry install; `alembic upgrade head` (PG) or seed.
2. Run tests: `pytest -q`.
3. **Boot the app** (`uvicorn app.main:app`), hit `/health` + a real endpoint with curl — prove it, don't assume.
4. Render the **build-summary card** (endpoints + JSON examples, `/docs` link, DB/Mongo/Kafka connections that exist).
5. Fix → rerun until green.

## Python "app" (non-service)
A minimal runnable Python project: `main.py` entry point, `pyproject.toml`/`requirements.txt`, a pytest test, README, and a runnable command. Same runnable-first + README discipline.

## Deliverables per build
Dockerfile (multi-stage, non-root, slim base), README (overview/stack/structure/API/env/run/troubleshoot), tests, `.env.example`. Explain architecture decisions.

> One-liner: *"FastAPI is the Python authority — FastAPI+Pydantic+SQLAlchemy/Alembic+pytest, DI via Depends, central exception handler, CRUD-by-default, local PG/Mongo/Kafka with dedicated-user bootstrap, public schema, build-verify + card. Never overrides spring-boot; Java stays with spring-boot."*
