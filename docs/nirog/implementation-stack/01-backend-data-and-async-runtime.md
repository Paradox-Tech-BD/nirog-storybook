# Backend, Data, and Async Runtime

## Backend runtime

Use a single Python 3.13 repository managed by `uv` and pinned through `uv.lock`. Run FastAPI behind Uvicorn workers in a container. Keep each Nirog module under `modules/<module>/{api,application,domain,infrastructure,migrations}` and keep `access`, `workers`, and the shared kernel as distinct composition areas.

Routes use strict Pydantic v2 request/response models. They map a transport DTO into an immutable application command containing typed identifiers, the evaluated capability, idempotency metadata, and expected version. Response models are allowlists. Use `application/problem+json` for safe, correlation-bearing failures.

## PostgreSQL and migrations

Use PostgreSQL 18 with one writer cluster and explicit schemas: `identity`, `catalog`, `prescription`, `regimen`, `adherence`, and `platform`. SQLAlchemy 2 plus `asyncpg` is the application persistence layer; retain explicit Core expressions where a repository needs a security-sensitive scoped query or a bulk operation. Alembic is the only schema-change mechanism.

Run three database roles: `nirog_migrator`, narrowly privileged runtime roles by process/module, and a controlled operational recovery role. No web/API process uses the owner role or `BYPASSRLS`. PostgreSQL RLS is defense in depth: enabled tables with no applicable policy default to deny, but API authorization and module ownership occur first. [1]

Every mutation commits aggregate state, idempotency record, redacted audit record, outbox event, and change-feed record in one transaction. Migrations are additive first, backwards compatible, resumable, observable, and feature-flagged before activation.

## Celery, Valkey, and object storage

Use Celery 5.6 with JSON-only identifier payloads and a managed Valkey transport. Do not use Celery’s result backend as a business record; `platform.consumer_ledger`, the outbox, and module records are authoritative. Route tasks to dedicated queues and process definitions:

| Queue | Process scope | Prohibited write |
|---|---|---|
| `ml` | preprocess, OCR, extraction, matching, review payload | `regimen.*`, `adherence.*`, access records |
| `catalog` | source ingestion, validation, indexing, release preparation | profile-private evidence/regimen data |
| `projection` | occurrence/change-feed projections | regimen policy or historical dose evidence |
| `notification` | delivery intent and provider telemetry | dose-event inference |
| `maintenance` | retention, reconciliation, evaluation, integrity work | arbitrary cross-schema deletion |

Set explicit soft/hard limits, I/O timeouts, classified retries with jitter, dead-letter/recovery flow, concurrency limits, and queue-specific autoscaling. Celery documents that delivery can redeliver tasks and recommends idempotence, timeouts, and dedicated routing for long-running work. [2]

Store evidence in private S3 buckets with KMS encryption, bucket policies limited to workload roles, short-lived upload/read grants, checksum and type/content verification, and manifest references in `prescription.*`. Do not pass object URLs or artifact bytes through a queue or general log.

## References

[1] [PostgreSQL — Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

[2] [Celery 5.6 — Tasks](https://docs.celeryq.dev/en/stable/userguide/tasks.html)
