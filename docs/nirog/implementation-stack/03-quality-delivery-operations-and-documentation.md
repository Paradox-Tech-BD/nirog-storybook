# Quality, Delivery, Operations, and Documentation

## Local development

Use Docker Compose profiles for `api`, `worker`, `relay`, `postgres`, `valkey`, `minio`, `otel-collector`, and observability services. Developers use synthetic fixtures only; production exports are never generic fixtures. Provide `just` or `task` commands for bootstrap, lint, type check, unit, integration, migration test, contract export/lint, local run, and test-environment reset.

## Required quality stack

| Control | Tooling | Release gate |
|---|---|---|
| Formatting/lint | Ruff | No formatting/lint errors. |
| Static typing | Pyright strict | No untyped boundary or invalid command/DTO contract. |
| Unit/application tests | pytest, pytest-asyncio, Hypothesis | State, validation, policy, and idempotency properties hold. |
| Integration | Testcontainers for PostgreSQL/Valkey/MinIO | RLS, migrations, storage grants, outbox, and worker retries work against real services. |
| API contract | FastAPI export, Redocly CLI, Schemathesis | OpenAPI lint, compatibility, documented problems, and negative authorization cases pass. |
| Security supply chain | Gitleaks, Semgrep, pip-audit, Trivy, Dependabot | No secrets, critical vulnerable packages, or unapproved container issue. |

Include explicit BOLA, RLS connection-reset, revocation, stale-version, idempotency, audit-redaction, raw-evidence leak, worker ownership, provider-unknown, replay, and restore/rebuild tests in CI. A green unit suite alone does not prove a release safe.

## Production delivery profile

Build minimal Docker images with BuildKit and publish signed images to ECR. Use GitHub Actions for pull-request verification, image scanning, OpenTofu plan, staged deployment, migration job control, and post-deploy smoke tests. Use OpenTofu to declare ECS Fargate services, autoscaling, RDS PostgreSQL, ElastiCache Serverless Valkey, S3, KMS, IAM roles, Secrets Manager, WAF, networking, dashboards, and alerts.

Deploy API, relay, and each queue class as separate ECS services/tasks. Start with one region and multi-AZ data services. Autoscale API on request concurrency/latency and worker pools on queue age plus resource utilization. Kubernetes is a later option, not a baseline requirement.

## Observability and operational safety

Instrument FastAPI, SQLAlchemy, HTTP clients, Celery task entrypoints, and provider adapters with OpenTelemetry. The FastAPI instrumentation supports manual or automatic instrumentation, exclusions, hooks, and header sanitization; configure only approved attributes and sanitize everything else. [1] Export traces to Tempo, metrics to Prometheus-compatible storage, logs to Loki/CloudWatch, and exceptions to Sentry with a scrubber.

Every record carries correlation and causation IDs, never raw evidence, OCR text, bearer tokens, cookies, health details, or unredacted provider payloads. Dashboard API latency/error rates, DB pool wait, RLS denials, outbox age, consumer lease age, worker queue age, retry/DLQ state, OCR stage quality/failure, provider errors, notification uncertainty, and backup/rebuild status.

## References

[1] [OpenTelemetry — FastAPI instrumentation](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html)
