# Stack Decision and Boundaries

## 1. Selected technology set

| Concern | Selection | Decision rationale |
|---|---|---|
| Application | Python 3.13, FastAPI, Uvicorn/Gunicorn | FastAPI fits typed HTTP contracts and async I/O without forcing a persistence library. [1] |
| Types and validation | Pydantic v2, frozen dataclasses, `NewType`, `StrEnum`, Pyright strict | Transport, commands, values, and persistence stay distinct; invalid identifiers and permissions do not travel as loose strings. |
| Canonical data | PostgreSQL 18, SQLAlchemy 2, `asyncpg`, Alembic | Relational transactions, module schemas, constraints, JSONB where justified, RLS, and migration discipline. |
| Deferred work | Celery 5.6, Valkey transport, PostgreSQL outbox and consumer ledger | Celery supports routed worker pools and retry; Nirog supplies idempotency and authoritative control state. [2] |
| Private artifacts | S3, KMS, checksum/content validation, `boto3` | Restricted evidence needs private object storage, short-lived grants, and immutable manifest references. |
| Identity | OIDC/OAuth2 adapter; Cognito in the AWS production profile | The IdP verifies identity; Nirog’s database owns profile grants, consent, and persisted permission snapshots. |
| Observability | OpenTelemetry Collector, `structlog`, Prometheus-compatible metrics, Grafana/Tempo/Loki, Sentry | End-to-end correlation with redaction enforced before export. [3] |
| Platform | Docker, ECR, ECS Fargate, RDS, ElastiCache Serverless Valkey, S3, KMS, Secrets Manager, WAF, OpenTofu | Managed services reduce operation burden while retaining separately scalable API and worker processes. [4] |
| Contract and docs | FastAPI OpenAPI 3.1, Redocly CLI, generated Dart/Dio client, Storybook MDX/Mermaid | One executable API source plus a human-readable architecture library; contract linting protects mobile integration. [5] |

## 2. Non-negotiable boundary rules

The route layer may parse HTTP and obtain dependencies; it may not write SQL or decide domain state. Application services own commands, authorization orchestration, transaction boundaries, audit, idempotency, and outbox creation. Domain code imports no FastAPI, SQLAlchemy, Celery, JWT, or vendor SDK. Infrastructure adapters implement narrow ports only.

PostgreSQL is the authoritative source for medication, profile access, consent, evidence state, releases, audit, and outbox records. Valkey is only a broker/cache. Object storage holds restricted artifacts referenced by database manifests. A worker receives IDs, fingerprints, release identifiers, and correlation IDs; it never receives a bearer token, raw prescription image, or permission snapshot.

## 3. Explicit deferrals

Nirog does **not** begin with Kubernetes, microservices, database-per-service, a generic Celery result-backend authority, GraphQL, a client-side authorization engine, or a vendor-specific OCR dependency in domain code. A future extraction is justified only by observed independent scale, security isolation, ownership, release cadence, or failure-domain requirements.

## References

[1] [FastAPI — SQL databases](https://fastapi.tiangolo.com/tutorial/sql-databases/)

[2] [Celery 5.6 — Tasks](https://docs.celeryq.dev/en/stable/userguide/tasks.html)

[3] [OpenTelemetry — FastAPI instrumentation](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html)

[4] [Amazon ElastiCache — managed Valkey/Redis-compatible cache](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)

[5] [Redocly CLI — OpenAPI linting](https://redocly.com/docs/cli/commands/lint)
