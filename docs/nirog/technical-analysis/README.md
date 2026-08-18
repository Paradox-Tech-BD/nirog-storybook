# Nirog Technical Analysis

**Status:** Active technical-analysis phase, authorized by the product owner. This directory converts the approved pre-analysis into implementation-oriented backend architecture. It is organized by responsibility so synchronous domain rules, asynchronous execution, ML safety, platform controls, and presentation material remain independently readable.

## Technical-analysis map

| Area | Purpose |
|---|---|
| [`00-system-architecture.md`](./00-system-architecture.md) | Recommended whole-backend runtime shape and ownership map. |
| [`01-user-management.md`](./01-user-management.md) | Identity, profiles, caregiver sharing, authorization, consent, devices, and APIs. |
| [`02-medicine-catalog.md`](./02-medicine-catalog.md) | Catalog ingestion, curation, releases, search, and product-reference APIs. |
| [`03-ml-evidence-safety.md`](./03-ml-evidence-safety.md) | ML stage contracts, evidence lineage, review gate, and safety enforcement. |
| [`04-async-workers.md`](./04-async-workers.md) | Outbox, queues, workers, retry semantics, DLQ, notifications, and sync. |
| [`05-api-persistence-security.md`](./05-api-persistence-security.md) | FastAPI modules, PostgreSQL layout, API conventions, RLS defense, and data controls. |
| [`06-operations-deployment.md`](./06-operations-deployment.md) | Environment topology, secrets, observability, release gates, backups, and runbooks. |
| [`presentation-script.md`](./presentation-script.md) | Speaker-ready script summarizing the pre-analysis and ML integration. |
| [`references.md`](./references.md) | Technical-analysis source register. |

## Design posture

The recommended initial deployment is a **modular monolith**: one FastAPI core API, one PostgreSQL cluster, one Redis-compatible broker/cache, restricted object storage, separate worker processes, and an independently deployable ML worker boundary. Modules own their tables and contracts even though they initially share a database. This avoids premature microservice operations while preserving clean extraction paths for GPU/ML execution and catalog curation.

All technical decisions must preserve the pre-analysis invariants: profile-scoped access, evidence before inference, user confirmation before regimen activation, release-bound catalog facts, append-only clinical-adjacent history, idempotent offline mutation, and traceable ML/policy lineage.
