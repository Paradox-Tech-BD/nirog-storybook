# Implementation Start Plan

## First repository layout

Create a dedicated backend repository with a `pyproject.toml`, `uv.lock`, `Dockerfile`, `compose.yaml`, `infra/`, `.github/workflows/`, `openapi/`, and the module structure defined in the Software and Access Architecture. Do not begin with every future module as an empty scaffold; add a module when its first command, migration, and test exists.

## First dependency set

The first production dependencies are `fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `sqlalchemy`, `asyncpg`, `alembic`, `celery`, a Valkey/Redis client, `boto3`, an OIDC/JWKS/JWT library, `structlog`, OpenTelemetry SDK/instrumentations/exporters, and a problem-details helper or local mapper. Development dependencies are Ruff, Pyright, pytest, pytest-asyncio, Hypothesis, Testcontainers, Schemathesis, and security scanners.

Add PaddleOCR and ONNX Runtime only to the ML worker image/profile. This prevents large ML dependencies from becoming API runtime dependencies and preserves separate scaling.

## Milestone order

| Milestone | Deliverable | Required proof |
|---|---|---|
| Foundation | Settings, dependency injection, typed IDs/errors, migration harness, database roles/RLS test fixture, correlation logging, outbox/idempotency primitives | RLS scope/reset, atomic outbox, safe problem response, and no sensitive telemetry. |
| Identity/access | OIDC verifier, account mapping, profile/consent/grant commands, RBAC permission registry, capability dependency | Cross-profile denial, live revocation, permission snapshot, owner/caregiver tests. |
| Catalog/evidence | Release model, restricted upload/manifest, scan job, stage run, manual review fallback | No raw queue/log data, lifecycle cancellation, release/fingerprint lineage. |
| Regimen/adherence | Manual and evidence-assisted commands, schedule policy, occurrence projection, dose/inventory/refill events | Confirmation boundary, version conflict, no worker medication write, reminder-not-dose test. |
| Mobile/notifications | Validated OpenAPI/Dart client, idempotent intent, change feed, device and provider telemetry | Offline replay, duplicate/unknown delivery, revoked sync, safe response contract. |
| ML/operations | OCR stage adapter, evaluation manifest, dashboards, alerts, backup/rebuild drill, progressive release controls | Evaluation thresholds, rollback, queue/retry/DLQ recovery, restore evidence. |

## Definition of ready to implement

Start coding only when the local compose environment, migration test, RLS test fixture, problem-details mapper, OpenAPI export/lint job, container build, and CI protection rules are in place. This prevents the first endpoint from becoming a precedent that bypasses authorization, transactions, audit, or contract governance.
