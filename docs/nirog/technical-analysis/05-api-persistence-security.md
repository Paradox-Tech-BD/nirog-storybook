# API, Persistence, and Security Architecture

## 1. API implementation shape

The FastAPI application should be a versioned modular monolith. Each module exposes routers, Pydantic request/response schemas, command/query services, repositories, policy dependencies, and event mappers. Cross-module writes happen through explicit command services or events, not imported ORM models.

```text
app/
  api/v1/                 # routers, error mapping, dependency wiring
  modules/
    identity/             # own domain, application, infrastructure, api
    catalog/
    prescription/
    regimen/
    adherence/
    platform/
  workers/                # task entrypoints only; call module application services
  shared/                 # typed IDs, time, result/error, telemetry utilities
  migrations/             # schema-owned migrations
```

Route handlers remain thin: parse request, resolve `ActorContext`, authorize resource/profile action, pass an immutable command to an application service, and serialize a resource/operation response. Business policy belongs in the module application/domain layer; SQL stays in repositories.

## 2. API conventions

| Concern | Technical rule |
|---|---|
| Versioning | All public endpoints begin `/v1`; event and resource schemas contain independent version fields. Breaking payload changes create `/v2` or a parallel representation. |
| Resource IDs | Use opaque UUIDs. Never treat UUID unpredictability as authorization; enforce capability on every object lookup. |
| Mutations | Require `Idempotency-Key`; persist request hash, status, response reference, and expiry in `platform.idempotency_records`. |
| Concurrency | Mutable aggregates expose an integer `version`; update commands require `If-Match` or `baseVersion`; stale commands return `409` with current version metadata. |
| Errors | Use `application/problem+json` with stable machine code, correlation ID, safe field violations, and retryability. Never include SQL, provider, model prompt, or other-profile detail. |
| Pagination | Keyset/cursor pagination with deterministic sort and module-specific opaque cursor; no unbounded exports through normal listing routes. |
| Uploads | API creates a short-lived restricted upload grant; direct object-store upload validates checksum/content type/size at completion. |
| Async operations | Return `202` plus job resource URL; no HTTP request waits for ML model, index build, push provider, or large import. |
| Read consistency | Command responses return the committed aggregate. Derived schedules, notifications, stats, and search indexes may be eventually consistent and surface `asOf`/release metadata. |

## 3. PostgreSQL schema and transaction model

Use one PostgreSQL cluster and logical schemas: `identity`, `catalog`, `prescription`, `regimen`, `adherence`, and `platform`. Database migrations are append-only and module-owned. A migration that affects another module requires a documented compatibility window and a two-step expand/migrate/contract rollout.

| Platform table | Purpose | Important fields |
|---|---|---|
| `platform.idempotency_records` | Mutating API repeat suppression | actor, key, request hash, status, response reference, expires_at |
| `platform.outbox_events` | Commit-coupled event publication | event ID, aggregate, sequence, envelope, occurred_at, publish state |
| `platform.consumer_ledger` | At-least-once event de-duplication | consumer, event ID, status, attempt, completed_at |
| `platform.audit_events` | Immutable security/business audit trail | actor, profile, action, target kind/ID, policy decision, correlation, redacted metadata |
| `platform.change_events` | Authorized mobile sync feed | profile, sequence, resource kind/ID/version, change kind, payload reference |
| `platform.feature_flags` | Versioned policy rollout | key, scope, version, state, effective period |
| `platform.retention_jobs` | Legal/retention execution | resource reference, policy version, status, hold reason |

Each command transaction uses `READ COMMITTED` plus explicit row locks/optimistic aggregate versions. Do not hold a transaction during provider calls or worker execution. For atomic command + event behavior, write the business aggregate, audit event, idempotency response, and outbox record together; relay after commit.

## 4. Authorization and privacy enforcement

Authentication is OIDC-based. A backend `ActorContext` includes local account ID, identity issuer/subject, token/session identifiers, device/installation ID when present, authentication context, correlation ID, and request source. It does not claim profile permissions. A profile capability is recomputed server-side from ownership, `profile_access`, consent state, and requested action.

PostgreSQL RLS is a defense-in-depth control for `profile_id` tables. The API sets transaction-local account/profile context only after the policy dependency succeeds. RLS must be enabled with policies for application roles; owner/migration roles must be separate because table owners and `BYPASSRLS` roles can bypass policy.[1] RLS does not replace API authorization, resource-specific permission checks, audit, or repository filters.

### 4.1 Data classification

| Class | Examples | Storage/transport rule |
|---|---|---|
| Account identity | email, OIDC subject, display name | encrypted at rest; redact from general logs; retain independently from health evidence. |
| Profile health context | profile identifiers, regimen, dose history, prescription metadata | profile-scoped authorization and audit; encrypted backups; never in analytics without approved minimization. |
| Restricted evidence | prescription images, OCR raw text/crops, provider raw output | object-store private; capability URLs short-lived; no queue/log payload; explicit retention/purge policy. |
| Shared reference | released catalog products, aliases, forms | release provenance; no profile data; cacheable after integrity validation. |
| Security/operational | audit event, idempotency key hash, trace ID, redacted failure | append-only/controlled access; retention supports investigation without storing content. |

### 4.2 Security baseline

- TLS terminates at the ingress; service-to-service requests use workload identity and TLS.
- Secrets are injected from a managed secret store, rotated, never committed, never returned from API, and never passed in queue messages.
- Password auth, if used in addition to OIDC, uses a modern adaptive password hash; authentication rate limits and breached-credential checks are configured separately.
- Object storage has no public buckets; uploads/downloads use narrow capability grants, server-side checksum verification, malware/content-type scanning, and audit.
- API request size, upload type, pagination, expensive search, login, invitation, and scan initiation have rate/cost limits.
- Security tests fuzz object IDs and fields, assert authorization on all routes, and block merges on BOLA/privilege regression.

## 5. External service adapter boundary

External dependencies are accessed only through module-owned adapters: OIDC provider, object storage, push provider, ML provider, embedding/index provider, email, and observability exporter. Adapters receive explicit typed requests and return typed results/errors. Provider-specific response JSON stays out of domain tables except as a restricted raw-result asset/reference for evidence lineage.

Each adapter specifies timeout, retry class, circuit-breaker behavior, idempotency key behavior, data fields permitted to leave the boundary, provider revision/config ID, and monitoring tags. The domain remains portable even when the adapter implementation is replaced.

## 6. Validation and test strategy

| Layer | Test responsibility |
|---|---|
| Unit/domain | Aggregate invariants, state transitions, permission-template validation, event/envelope construction, policy function truth tables. |
| Repository | unique/FK/check constraints, RLS transaction context, query scoping, optimistic locking, migration compatibility. |
| API integration | OIDC actor mapping, BOLA tests, idempotency replay, stale version conflict, error redaction, capability URLs. |
| Worker integration | duplicate delivery, retry class, outbox relay crash windows, release/version mismatch, DLQ recovery. |
| Contract | OpenAPI response compatibility, event payload schema compatibility, provider adapter fake/recorded responses. |
| End-to-end | caregiver access/revocation, scan-to-review-to-regimen, schedule/notification, offline conflict, retention hold. |

## References

[1] [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

[2] [OWASP API1:2023 Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
