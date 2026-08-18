# Nirog Implementation Technology Stack

## Purpose

This library converts the Nirog architecture into one practical implementation baseline. It selects concrete technologies for the backend, database, workers, evidence storage, identity, Flutter interface, quality controls, delivery platform, and documentation. It does not replace the existing architecture; it supplies the tools that implement it.

> **Selected baseline:** Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2 with `asyncpg`, PostgreSQL 18, Alembic, Celery 5.6, managed Valkey, private S3/KMS object storage, generic OIDC with an AWS Cognito production profile, OpenTelemetry, Docker, OpenTofu, GitHub Actions, ECS Fargate, and Storybook plus OpenAPI/Redocly documentation.

## Reading order

| Order | Document | Primary decision |
|---|---|---|
| `00` | [Stack Decision and Boundaries](00-stack-decision-and-boundaries.md) | The chosen stack, what it deliberately excludes, and the core boundary rules. |
| `01` | [Backend, Data, and Async Runtime](01-backend-data-and-async-runtime.md) | How FastAPI, typed models, PostgreSQL, migrations, Celery, Valkey, and S3 fit together. |
| `02` | [Access, ML, Flutter, and Contract Stack](02-access-ml-flutter-and-contract-stack.md) | How OIDC/RBAC, policy evolution, evidence-only OCR, Flutter, and OpenAPI integrate safely. |
| `03` | [Quality, Delivery, Operations, and Documentation](03-quality-delivery-operations-and-documentation.md) | Local development, testing, CI, deployment, observability, security supply chain, and documentation tooling. |
| `04` | [Implementation Start Plan](04-implementation-start-plan.md) | The repository structure, first dependency set, environment topology, and safe milestone order. |

## Decision posture

Nirog starts with a **modular monolith and separately scaled worker processes**, not microservices or Kubernetes. PostgreSQL remains authoritative. Celery messages are delivery prompts, not business state. OCR creates reviewable evidence, not medication action. The Flutter app is an intent and rendering client. The API contract and policy checks are server-owned.

## Companion libraries

Read this alongside [Unified System Architecture](../system-architecture/README.md), [Software and Access Architecture](../software-access-architecture/README.md), [Technical Analysis](../technical-analysis/README.md), and [Data Management](../data-management/README.md). Research evidence and direct source links are in [research-notes.md](research-notes.md).
