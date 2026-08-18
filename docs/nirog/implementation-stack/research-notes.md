# Nirog Implementation Stack — Research Notes

## Purpose

These notes capture the evidence and selection criteria used to turn the established Nirog architecture into a concrete implementation stack. The selected stack must preserve the system invariants already agreed: one authoritative PostgreSQL database, a modular FastAPI/Python application, isolated worker pools, profile-scoped authorization, restricted evidence, transactional outbox delivery, Flutter as a non-authoritative client, and a future RBAC-plus-policy extension seam.

## Authoritative findings

| Area | Finding | Nirog implication |
|---|---|---|
| FastAPI persistence | FastAPI is not coupled to a database library; its official documentation presents PostgreSQL as the production relational-database choice and separates request/response data models from persistence choices. [1] | Use FastAPI with explicit Pydantic v2 transport models and SQLAlchemy 2 persistence mapping rather than coupling route schemas to ORM entities. |
| Celery delivery | Celery stable documentation emphasizes idempotent tasks, explicit timeouts, retries, dedicated routing for long-running jobs, and protection of sensitive task arguments. [2] | Use Celery 5.6 with separate queues/pools and PostgreSQL outbox/consumer-ledger authority; messages carry IDs, release versions, and correlation data only. |
| PostgreSQL RLS | PostgreSQL RLS supports command- and role-specific policies; enabled tables with no policy default to deny. Owners and `BYPASSRLS` roles must be treated deliberately. [3] | Use database roles, transaction-local profile context, explicit policies, no app-owner runtime role, and RLS integration/reset tests as defense in depth. |
| FastAPI telemetry | OpenTelemetry supports automatic/manual FastAPI instrumentation, URL exclusion, hooks, and header sanitization. [4] | Instrument API, database, outbound adapters, and workers with OpenTelemetry, but use explicit allowlists and sanitization so evidence, tokens, cookies, and health data never become trace attributes. |
| Redis-compatible runtime | ElastiCache offers a managed serverless Valkey-compatible cache/broker endpoint and removes node-capacity operations. [5] | Use managed Valkey for Celery transport and bounded cache use. It is not an authoritative store, result system of record, or durable access-control source. |
| API governance | Redocly CLI 2.x lints OpenAPI and supports project-specific rule configuration and GitHub Actions annotations. [6] | Export the FastAPI OpenAPI contract in CI, enforce Nirog rules with Redocly, and generate a Flutter client only from validated contract artifacts. |

## Provisional recommended stack

| Capability | Selected component | Boundary or guardrail |
|---|---|---|
| Runtime | Python 3.13, `uv`, FastAPI, Uvicorn/Gunicorn container entrypoint | Pin all versions in `uv.lock`; no business logic in route handlers. |
| Validation and types | Pydantic v2 strict models, frozen dataclasses, `NewType` identifiers, `StrEnum` registries, Pyright strict | Separate transport DTOs, commands, domain values, persistence rows, and read models. |
| Persistence | PostgreSQL 18, SQLAlchemy 2 async ORM/Core, `asyncpg`, Alembic | One canonical cluster; explicit migrations, module schemas, database roles/RLS, and no `create_all()` in production. |
| Async work | Celery 5.6, managed Valkey transport, outbox relay, consumer ledger | Separate `ml`, `catalog`, `projection`, `notification`, and `maintenance` queues; no raw evidence or bearer tokens in tasks. |
| Object evidence | Amazon S3 private buckets, KMS encryption, `boto3`, short-lived scoped grants | No public buckets, permanent client URLs, or sensitive logs; checksum and malware/content validation before processing. |
| Identity/access | Generic OIDC adapter; Amazon Cognito recommended on the AWS production profile; JWT verification with `PyJWT`/JWKS caching | Database-owned profile grants and permission snapshots remain authorization authority; the IdP authenticates only. |
| ML/OCR | Pluggable `PrescriptionOcrPort`; self-hosted PaddleOCR/ONNX baseline with separately approved managed-provider adapter | OCR output is restricted reviewable evidence only; release manifests, evaluation harness, and user confirmation required. |
| Flutter integration | OpenAPI 3.1 contract, generated Dart/Dio client, `freezed`/`json_serializable`, local intent queue with Drift | Flutter never embeds access policy or mutates clinical state offline; idempotency and change-feed contracts are server-owned. |
| Observability | OpenTelemetry SDK/Collector, structured `structlog` JSON, Prometheus-compatible metrics, Grafana/Tempo/Loki, Sentry | Correlation IDs only; redaction-before-export; no source image, OCR text, tokens, or private health data in telemetry. |
| Quality/security | Ruff, Pyright, pytest, pytest-asyncio, Testcontainers, Hypothesis, Schemathesis, Redocly CLI, Semgrep, Gitleaks, Trivy, pip-audit | CI blocks release on type, migration, RLS, authorization, contract, secret, dependency, and container failures. |
| Delivery/platform | Docker BuildKit, Amazon ECR, ECS Fargate services, RDS PostgreSQL, ElastiCache Valkey, S3, Secrets Manager, WAF, OpenTofu, GitHub Actions | API, relay, and each worker class scale independently; no Kubernetes until observed scale or isolation needs require it. |
| Documentation | Storybook MDX + Mermaid for architecture/workflow library; FastAPI-generated OpenAPI; Redocly lint/reference; ADRs kept beside implementation source | Storybook remains the human architecture hub; the API specification becomes a versioned executable contract. |

## Explicit non-selections for the first implementation

The baseline does not introduce microservices, a second operational database, a generic result-backend authority, a database-per-service model, a broad self-hosted identity system, an API gateway policy engine, or Kubernetes. Those choices would add operating cost or weaken the already documented ownership boundaries before Nirog has evidence that the modular-monolith shape is insufficient.

## References

[1] [FastAPI — SQL (Relational) Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/)

[2] [Celery 5.6 — Tasks](https://docs.celeryq.dev/en/stable/userguide/tasks.html)

[3] [PostgreSQL 18 — Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

[4] [OpenTelemetry — FastAPI Instrumentation](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html)

[5] [Amazon ElastiCache — What is ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)

[6] [Redocly CLI — lint](https://redocly.com/docs/cli/commands/lint)
