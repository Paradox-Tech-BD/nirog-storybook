# Railway Deployment with PostgreSQL Outbox and Cloudflare R2

**Status:** AWS-free deployment baseline implemented  
**Required services:** Railway Core API, Railway dispatcher, Railway PostgreSQL, managed Valkey/Redis, Clerk, and Cloudflare R2  
**Not required:** AWS account, SQS, LocalStack, IAM access key, or AWS object storage

## Operating model

Nirog Core uses PostgreSQL as the durable asynchronous-work boundary. A clinical command writes its business state, audit event, and `platform.outbox_events` row in the same PostgreSQL transaction. A separate Railway dispatcher service polls that table, claims eligible rows with `FOR UPDATE SKIP LOCKED`, calls only explicitly registered handlers, and records a published, retry, or dead-letter result.

```mermaid
sequenceDiagram
    participant API as Railway Core API
    participant DB as Railway PostgreSQL
    participant D as Railway Dispatcher
    participant R2 as Cloudflare R2
    participant W as Future ML/Domain handler

    API->>DB: Commit clinical change + audit + outbox row
    D->>DB: Claim eligible rows with SKIP LOCKED lease
    D->>W: Invoke registered event handler
    opt evidence work
        W->>R2: Use narrow server-side R2 adapter
    end
    alt handler succeeds
        D->>DB: Mark outbox row published
    else handler fails below retry limit
        D->>DB: Release lease; schedule retry
    else attempts exhausted
        D->>DB: Mark dead-lettered; retain safe failure code
    end
```

PostgreSQL documents `SKIP LOCKED` as suitable for queue-like consumers accessing a shared table; it lets concurrent dispatcher instances skip rows already locked by another worker instead of waiting. [1]

## Railway services

| Railway service | Responsibility | Required setting |
|---|---|---|
| **Core API** | Serves Clerk-authenticated HTTP requests and writes outbox rows atomically with domain changes. | `OUTBOX_WORKER_ENABLED=false` |
| **Dispatcher** | Polls and processes only registered outbox handlers. Run as a separate worker service from the same repository. | `OUTBOX_WORKER_ENABLED=true` |
| **PostgreSQL** | Durable clinical data, audit events, outbox lease/retry/dead-letter state. | Shared `DATABASE_URL` with role-appropriate credentials |
| **Valkey/Redis** | Shared authenticated HTTP rate-limit store. | `RATE_LIMIT_REDIS_URL` |
| **Cloudflare R2** | Private prescription/evidence objects only. | `EVIDENCE_STORAGE_DRIVER=r2` with R2 credentials |

No API or worker configuration contains an AWS credential, queue URL, or LocalStack endpoint.

## Railway API variables

Add these in **Railway → Core API service → Variables**. Keep R2 credentials sealed; the database and Redis values should come from the Railway services or a managed provider’s private connection variables.

```env
NIROG_APP_ENV=production
NIROG_RUNTIME_ROLE=api
PORT=${{PORT}}
DATABASE_URL=<Railway PostgreSQL application URL>
POSTGRES_URL=<Railway PostgreSQL migration/admin URL>
RATE_LIMIT_REDIS_URL=<managed Valkey or Redis TLS URL>

# The API writes outbox rows but never polls them.
OUTBOX_WORKER_ENABLED=false
OUTBOX_POLL_INTERVAL_MS=1000
OUTBOX_BATCH_SIZE=20
OUTBOX_LEASE_SECONDS=60
OUTBOX_RETRY_DELAY_SECONDS=30
OUTBOX_MAX_ATTEMPTS=12

# Cloudflare R2, private evidence storage
EVIDENCE_STORAGE_DRIVER=r2
EVIDENCE_R2_ENDPOINT=https://<CLOUDFLARE_ACCOUNT_ID>.r2.cloudflarestorage.com
EVIDENCE_R2_REGION=auto
EVIDENCE_R2_BUCKET=nirog-evidence
EVIDENCE_R2_ACCESS_KEY_ID=<sealed R2 access key>
EVIDENCE_R2_SECRET_ACCESS_KEY=<sealed R2 secret key>
EVIDENCE_PRESIGN_MAX_SECONDS=300

# Clerk
CLERK_PUBLISHABLE_KEY=<Clerk publishable key>
CLERK_JWT_KEY=<Clerk JWT public key>
CLERK_AUDIENCE=nirog-mobile-api
CLERK_AUTHORIZED_PARTIES=https://<Nirog-Web-domain>
```

## Railway dispatcher variables

Create a second Railway service from the same `nirog-core` repository. Use start command:

```bash
pnpm --filter @nirog/dispatcher dev
```

Give it the Railway PostgreSQL dispatcher connection string and the outbox controls below. It does not need Clerk credentials or an R2 credential until an explicitly registered handler needs either integration.

```env
NIROG_APP_ENV=production
NIROG_RUNTIME_ROLE=dispatcher
DATABASE_URL=<Railway PostgreSQL dispatcher URL>
POSTGRES_URL=<Railway PostgreSQL migration/admin URL>

OUTBOX_WORKER_ENABLED=true
OUTBOX_POLL_INTERVAL_MS=1000
OUTBOX_BATCH_SIZE=20
OUTBOX_LEASE_SECONDS=60
OUTBOX_RETRY_DELAY_SECONDS=30
OUTBOX_MAX_ATTEMPTS=12

# No Clerk, R2, or API rate-limit configuration is required until a registered handler explicitly needs one.
EVIDENCE_STORAGE_DRIVER=disabled
```

Railway service and shared variables are available at build and runtime. Store access keys and private connection credentials as sealed variables; Railway documents that sealed values cannot subsequently be read through the UI or API. [2]

## Lease, retry, and dead-letter rules

| Setting | Default | Meaning |
|---|---:|---|
| `OUTBOX_POLL_INTERVAL_MS` | 1,000 ms | Delay between dispatcher claim cycles. |
| `OUTBOX_BATCH_SIZE` | 20 | Maximum compatible events claimed in one transaction. |
| `OUTBOX_LEASE_SECONDS` | 60 s | Time a claimed row is unavailable to another dispatcher after a crash or slow handler. |
| `OUTBOX_RETRY_DELAY_SECONDS` | 30 s | Minimum delay before a transient handler failure becomes eligible again. |
| `OUTBOX_MAX_ATTEMPTS` | 12 | Failed deliveries at or above this count become `dead_lettered_at` records. |

The dispatcher deliberately claims only event types for which a handler has been registered. With no handlers registered, it claims nothing. This prevents a generic worker from falsely marking an unknown clinical event as delivered.

The forward migration `0002_postgres_outbox_dispatcher.sql` adds `next_attempt_at`, `dead_lettered_at`, and `last_failure_code`, plus an index for eligible unpublished events. Dead-lettered rows remain in PostgreSQL for safe operational review; they are not silently discarded.

## Cloudflare R2 boundary

Cloudflare R2 remains private evidence storage only. The Core server-side adapter uses the R2 S3-compatible endpoint and short-lived presigned URLs. Flutter and Nirog Web never receive R2 credentials. The user-controlled evidence path therefore remains:

```text
Flutter / Nirog Web → Clerk-authenticated Core command → scoped R2 presign → private R2 object
```

The exact content type, object key, profile scope, purpose, consent rule, and expiry belong to the forthcoming prescription/OCR slice. Cloudflare documents R2’s S3-compatible API and presigned URL rules. [3]

## Local development

Local Compose requires only PostgreSQL and Valkey:

```bash
pnpm bootstrap
docker compose up --build
```

The API service has `OUTBOX_WORKER_ENABLED=false`. The dispatcher service has it set to `true`. Evidence storage is disabled locally by default, avoiding any pretend local object store. Set actual non-production R2 variables only when you explicitly need an R2 integration test.

## References

[1] [PostgreSQL — `SELECT` locking clauses and `SKIP LOCKED`](https://www.postgresql.org/docs/current/sql-select.html)

[2] [Railway — Using Variables and sealed variables](https://docs.railway.com/variables)

[3] [Cloudflare R2 — S3-compatible API](https://developers.cloudflare.com/r2/api/s3/api/)
