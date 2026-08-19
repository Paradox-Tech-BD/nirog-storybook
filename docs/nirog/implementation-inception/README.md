# Nirog Implementation Inception

## Purpose

This library turns the approved Nirog architecture into an executable starting plan. It supersedes only the earlier **FastAPI/SQLAlchemy implementation option**: the clinical core is now a **Node.js/TypeScript service using Fastify, TypeBox, Drizzle, and PostgreSQL**. It does not weaken any settled medical-safety, profile-scope, consent, evidence, worker, or audit decision.

> **Implementation decision:** Nirog is not a forked Strapi clinical application. It is a Drizzle-owned clinical core with a **bounded Strapi administration plane**. Strapi supports workforce catalog drafting and non-clinical editorial work; Nirog Core remains the only authority for patient data, Flutter APIs, RLS, user-specific RBAC/PBAC, regimen state, AI usage, and clinical evidence workflows.

| Area | Selected implementation | Authority boundary |
|---|---|---|
| Clinical API | Node 24 LTS, TypeScript, Fastify 5, TypeBox, `jose` | Nirog Core only |
| Persistence | PostgreSQL 18, Drizzle ORM/Kit, `postgres` driver, explicit SQL RLS migrations | Nirog Core only |
| Asynchronous processing | Transactional outbox, SQS, LocalStack in development, consumer ledger | Nirog Core owns state changes |
| ML and retrieval | Separate Python 3.13 worker images, PaddleOCR/ONNX Runtime as required, `pgvector` | Evidence/retrieval only; never regimen authority |
| Workforce administration | Pinned Strapi project, custom Nirog admin plugin where needed | Separate database and workforce identities |
| API reference | Fastify OpenAPI output, Scalar at `/reference`, Redocly CI checks | Generated from Nirog Core routes |
| Delivery | Docker Compose locally; AWS ECS/Fargate, RDS, SQS, Cloudflare R2, and secret-managed credentials in production | Environment-specific deployment only |

## Reading order

| Order | Document | Use it when |
|---|---|---|
| 1 | [00 — Platform Decision and Boundaries](00-platform-decision-and-boundaries.md) | Confirming why Strapi is bounded and where every runtime belongs. |
| 2 | [01 — Workspace and Filesystem](01-backend-workspace-and-filesystem.md) | Creating the repositories and their modular source layout. |
| 3 | [02 — Database, Drizzle, and Schema Plan](02-database-drizzle-and-schema-plan.md) | Adding schemas, migrations, RLS, and database roles. |
| 4 | [03 — Access, Validation, and API Documentation](03-access-validation-and-api-documentation.md) | Implementing OIDC, RBAC/PBAC seams, validation, OpenAPI, and Scalar. |
| 5 | [04 — Async, ML/RAG, and AI Usage Ledger](04-async-ml-rag-and-ai-usage-ledger.md) | Adding queues, workers, retrieval, and per-user AI accounting. |
| 6 | [05 — Docker, Tests, and Delivery Controls](05-docker-tests-and-delivery-controls.md) | Running safely in local Docker and enforcing CI quality gates. |
| 7 | [06 — Staged Environment Execution Plan](06-staged-environment-execution-plan.md) | Implementing in dependency-safe increments. |
| 8 | [07 — Clerk User-Subsystem Design](07-clerk-user-subsystem-design.md) | Reviewing the approved Clerk identity, profile-access, RLS, and API rules. |
| 9 | [08 — Clerk User-Subsystem Implementation](08-clerk-user-subsystem-implementation.md) | Confirming the verified implementation scope, API contract, and deliberately deferred user-domain work. |
| 10 | [09 — Clean Architecture and Development Artifacts](09-clean-architecture-and-development-artifacts.md) | Reviewing the executable layer boundaries, Scalar/API contract endpoints, and Drizzle migration workflow. |
| 11 | [10 — Feature-Sliced HTTP Platform](10-feature-sliced-http-platform.md) | Reviewing focused user modules, common response/error semantics, generated Scalar/OpenAPI, and user-aware rate limits. |
| 12 | [11 — Cloudflare R2 Evidence Storage](11-cloudflare-r2-evidence-storage.md) | Configuring private evidence objects through R2 while preserving the separate SQS worker transport. |
| 13 | [12 — Railway PostgreSQL Outbox Deployment](12-railway-postgresql-outbox-deployment.md) | Deploying Core API and dispatcher services on Railway with PostgreSQL leases, retries, and Cloudflare R2 evidence storage. |

The [research notes](research-notes.md) preserve the evidence behind the technology and Strapi decision.

## Non-negotiable rules

The backend does not expose Strapi content APIs to Flutter. The backend does not let a worker connect as an unscoped human user, write regimen/adherence tables, or infer clinical authority from ML/RAG output. All profile-scoped data access performs actor, profile capability, permission, resource relation, consent/purpose, and state validation before mutation. Database RLS remains a defense in depth and is never replaced by HTTP middleware.

Every route has a declared request and response schema. Every mutation is idempotent, audited, version-aware where needed, and emits an outbox event within the same transaction. Every AI-provider invocation has a server-side quota decision and an immutable usage-ledger trail; the client never supplies a token count, model cost, or permission decision.

## Repositories

| Repository | Source | Purpose |
|---|---|---|
| `Paradox-Tech-BD/nirog-core` | New private repository | The main Nirog Core pnpm workspace, database contracts, Python worker images, Docker environment, and API. |
| `Paradox-Tech-BD/nirog-strapi-admin` | New private Strapi application pinned to a released upstream version | Workforce catalog draft and editorial administration only. It is not a fork of Strapi’s internal core. |
| `Paradox-Tech-BD/nirog-storybook` | Existing repository | Human-readable architecture, ADRs, execution plans, diagrams, and presentation material. |
| `Paradox-Tech-BD/nirog-backend` | Existing private repository | Preserved FastAPI prototype; not overwritten by the approved clinical-core implementation. |

## References

[1] [Nirog — Implementation Stack](../implementation-stack/README.md)

[2] [Nirog — Software and Access Architecture](../software-access-architecture/README.md)

[3] [Nirog — System Architecture](../system-architecture/README.md)

[4] [Implementation inception research notes](research-notes.md)
