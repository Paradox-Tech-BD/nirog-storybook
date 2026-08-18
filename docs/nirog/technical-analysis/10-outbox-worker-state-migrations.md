# Database Migration Plan: Outbox and Worker Retry State Machine

## 1. Purpose and migration posture

This plan introduces the database structures needed for the documented asynchronous architecture: a transactional outbox, consumer ledger, retry/lease state, provider-intent reconciliation, dead-letter recovery, and maintenance reconciliation. It assumes PostgreSQL and a migration framework such as Alembic, but the migration sequence is implementation-neutral.

The plan follows **expand → deploy compatible code → backfill/activate → contract**. A worker or relay version must understand both the prior and current schema while a migration is being rolled out. New tables and nullable/additive fields are deployed before workers rely on them. Destructive cleanup, stronger constraints, and retention deletion occur only after compatible writers/readers and outstanding jobs have crossed the declared compatibility window.[1]

> **Authoritative-state rule:** The broker is not the system of record. PostgreSQL stores event intent, worker state, provider intent, recovery decisions, and release metadata. Broker messages are identifier-bearing delivery attempts that may be duplicated.

## 2. Migration map

| Revision | Purpose | Additive schema result | Activation gate |
|---|---|---|---|
| `platform_0001` | Establish platform schema and scoped database roles | `platform` schema, migration role, API role, worker roles, timestamp helper | roles verified; API/worker roles do not own protected tables or carry `BYPASSRLS` |
| `platform_0002` | Create transactional outbox | `platform.outbox_events` plus claim/publish indexes | API writes outbox row atomically but relay remains disabled |
| `platform_0003` | Add consumer ledger and retry lease state | `platform.consumer_ledger` with idempotency key, lease, retry, expiry, and terminal fields | workers perform dry-run claim/state checks without external effects |
| `platform_0004` | Add external provider intent/reconciliation | `platform.external_effects` with deterministic provider key | provider adapters persist intent before network call |
| `platform_0005` | Add DLQ and recovery-decision records | `platform.dead_letter_entries`, `platform.recovery_actions` | operator UI/runbook can classify redacted failures |
| `platform_0006` | Add reconciliation job state | `platform.reconciliation_jobs` and lease/indexes | scheduled sweeps are canaried with write limits |
| `platform_0007` | Enable relay and consumer paths gradually | no destructive schema change; optional backfill of legacy pending work | relay then one low-risk consumer queue activated under metrics/rollback control |
| `platform_0008` | Enforce mature constraints and retention | validated `CHECK`/foreign keys where appropriate, retention indexes/partitions if volume requires | all current writers comply; rollback window and restore test complete |

## 3. `platform_0001`: schema, roles, and common conventions

Create the `platform` schema and separate database roles before creating tables. The normal API role writes platform records through application services. Relay, worker, maintenance, and migration roles receive only their required grants. The migration role may own migration objects, but the normal API and worker roles must not own profile-protected tables or have `BYPASSRLS`; PostgreSQL table owners and such roles can bypass row security.[2]

All state timestamps use `timestamptz`. IDs use application-generated UUIDv7 or UUID. Worker scheduling and lease comparison should use database time, such as `CURRENT_TIMESTAMP`, to avoid treating a worker-local clock as authoritative. Store raw restricted evidence, access tokens, and full provider payloads outside these platform tables; platform diagnostics hold redacted error code, safe metadata, and a restricted asset/reference ID only.

## 4. `platform_0002`: transactional outbox

`platform.outbox_events` records the committed event intent in the same transaction as a domain aggregate change, audit event, and idempotency response. It carries a stable event ID across all relay publication attempts.

| Column group | Suggested fields | Purpose |
|---|---|---|
| Event identity | `id`, `event_type`, `payload_version`, `aggregate_type`, `aggregate_id`, `aggregate_version`, `profile_id nullable` | stable, versioned envelope and ordering context |
| Payload and trace | `payload jsonb`, `occurred_at`, `correlation_id`, `causation_id` | minimum event data; payload excludes raw images/tokens/full OCR output |
| Publication state | `available_at`, `lease_token nullable`, `lease_expires_at nullable`, `publish_attempt_count`, `published_at nullable`, `last_error_code nullable` | safe relay claim, retry, and publish visibility |
| Audit/retention | `created_at`, `retention_class`, `archived_at nullable` | operational retention without losing required history |

```sql
CREATE TABLE platform.outbox_events (
  id uuid PRIMARY KEY,
  event_type text NOT NULL,
  payload_version integer NOT NULL,
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  aggregate_version integer NOT NULL,
  profile_id uuid NULL,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL,
  correlation_id uuid NOT NULL,
  causation_id uuid NULL,
  available_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lease_token uuid NULL,
  lease_expires_at timestamptz NULL,
  publish_attempt_count integer NOT NULL DEFAULT 0,
  published_at timestamptz NULL,
  last_error_code text NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (payload_version > 0),
  CHECK (aggregate_version > 0),
  CHECK (publish_attempt_count >= 0)
);

CREATE INDEX outbox_claim_pending_idx
  ON platform.outbox_events (available_at, occurred_at)
  WHERE published_at IS NULL;

CREATE INDEX outbox_aggregate_order_idx
  ON platform.outbox_events (aggregate_type, aggregate_id, aggregate_version);
```

The relay claim is an atomic update/select pattern using `FOR UPDATE SKIP LOCKED`, `available_at <= CURRENT_TIMESTAMP`, and an expired-or-null lease condition. A relay sets a freshly generated `lease_token`, incremented publish attempt count, and lease expiry in the claim transaction. A later status update must match that lease token. This fencing rule prevents an expired relay from overwriting current claim state after a pause or failover.

The initial API deployment writes the outbox row but does not require the relay to be active. This allows the team to validate transaction behavior and count pending events before external delivery begins. The transactional-outbox pattern specifically addresses the failure in which a database state change commits but the corresponding message is never published.[3]

## 5. `platform_0003`: consumer ledger and retry state

The consumer ledger gives every consumer its own idempotent state for a stable event ID. It is intentionally not foreign-keyed to the outbox row: outbox records may be archived/retained on a different schedule, and a consumer may receive a valid controlled event from a separate internal source. The unique key is `(consumer_name, event_id)`.

| Column group | Suggested fields | Purpose |
|---|---|---|
| Identity | `consumer_name`, `event_id`, `event_type`, `aggregate_version` | consumer-local idempotency and compatibility context |
| State | `status`, `attempt_count`, `next_attempt_at`, `expires_at`, `started_at`, `completed_at` | explicit lifecycle and retry budget |
| Lease | `lease_token`, `lease_expires_at`, `last_heartbeat_at` | current worker ownership and long-task protection |
| Result | `output_reference`, `error_class`, `last_error_code`, `safe_error_metadata` | redacted outcome and diagnostic linkage |
| Trace | `correlation_id`, `created_at`, `updated_at` | investigation and operation |

```sql
CREATE TABLE platform.consumer_ledger (
  consumer_name text NOT NULL,
  event_id uuid NOT NULL,
  event_type text NOT NULL,
  aggregate_version integer NULL,
  status text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NULL,
  expires_at timestamptz NULL,
  lease_token uuid NULL,
  lease_expires_at timestamptz NULL,
  last_heartbeat_at timestamptz NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  output_reference text NULL,
  error_class text NULL,
  last_error_code text NULL,
  safe_error_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (consumer_name, event_id),
  CHECK (attempt_count >= 0)
);

CREATE INDEX consumer_ledger_claim_idx
  ON platform.consumer_ledger (consumer_name, next_attempt_at, created_at)
  WHERE status IN ('received', 'retry_scheduled', 'outcome_unknown');

CREATE INDEX consumer_ledger_lease_idx
  ON platform.consumer_ledger (lease_expires_at)
  WHERE status = 'claimed';
```

Use an application-validated state set: `received`, `claimed`, `processing`, `retry_scheduled`, `outcome_unknown`, `completed`, `terminal_failed`, `superseded`, `cancelled`, and `expired`. Start with `text` plus application validation and additive check constraints only after all deployed workers accept the set. This avoids a breaking enum alteration during an independently rolling worker fleet. Status transitions are compare-and-set updates that require the current `lease_token` where a worker owns an active claim.

The activation order is deliberate. First deploy ledger-aware worker code in a **dry-run** mode that claims/relinquishes safely and emits metrics without provider calls. Next enable it for one low-risk projection consumer. Finally activate provider/ML consumers after duplicate, expiry, retry, and long-lease tests pass.

## 6. `platform_0004`: external provider effect intent

At-least-once queue delivery cannot itself guarantee exactly-once external side effects. Persist a provider-intent record before a request crosses the network. The unique `(provider_name, idempotency_key)` prevents a duplicate worker attempt from creating another intent. It also gives a reconciler a durable lookup key if the request outcome is unknown.

```sql
CREATE TABLE platform.external_effects (
  id uuid PRIMARY KEY,
  provider_name text NOT NULL,
  idempotency_key text NOT NULL,
  effect_kind text NOT NULL,
  consumer_name text NOT NULL,
  event_id uuid NOT NULL,
  status text NOT NULL,
  provider_request_id text NULL,
  provider_response_reference text NULL,
  requested_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at timestamptz NULL,
  reconciliation_due_at timestamptz NULL,
  last_error_code text NULL,
  safe_error_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  correlation_id uuid NOT NULL,
  UNIQUE (provider_name, idempotency_key)
);

CREATE INDEX external_effect_reconcile_idx
  ON platform.external_effects (reconciliation_due_at)
  WHERE status = 'outcome_unknown';
```

The approved statuses are `intent_recorded`, `requesting`, `accepted`, `completed`, `retry_scheduled`, `outcome_unknown`, `terminal_failed`, `cancelled`, and `expired`. The request body itself is not stored here if it contains restricted evidence; use a narrow reference to the module-owned record. A provider adapter must obtain the record, send the same deterministic key, and transition the outcome in a transaction with the consumer ledger/result state where ownership permits.

## 7. `platform_0005`: dead-letter and recovery decision records

Dead-letter queues are delivery transport; the database stores the durable recovery workflow. A `dead_letter_entries` row references consumer/event/task state, captures a redacted snapshot, and records whether the work is eligible for requeue, cancellation, supersession, manual resolution, or defect remediation. A separate append-only `recovery_actions` record stores the operator/system actor, decision, reason code, source release, and resulting new attempt/reference.

| Table | Key fields | Constraint/retention rule |
|---|---|---|
| `platform.dead_letter_entries` | `id`, `consumer_name`, `event_id`, `ledger_reference`, `classification`, `status`, `first_failed_at`, `last_failed_at`, `redacted_diagnostic`, `source_release` | unique active entry per consumer/event; no raw evidence or access tokens |
| `platform.recovery_actions` | `id`, `dead_letter_id`, `action`, `actor_kind`, `actor_reference`, `reason_code`, `created_at`, `result_reference` | append-only; every operator requeue/cancel/supersede is auditable |

Do not create an automatic database trigger that blindly republishes a DLQ record. A recovery action first reloads current aggregate, consent, release, cancellation, expiry, and idempotency state; only then does it create a fresh outbox event or retry record.

## 8. `platform_0006`: reconciliation job state

Reconciliation turns ambiguous external and derived state into an explicit scheduled workflow. `platform.reconciliation_jobs` stores a job kind, target reference, schedule/lease state, attempt budget, last result, next run time, and policy/release reference. It supports unpublished-outbox sweeps, expired consumer-lease recovery, unknown provider-effect reconciliation, asset/reference checks, projection verification, and index checksum validation.

| Job kind | Authoritative comparison | Safe repair |
|---|---|---|
| `outbox_sweep` | committed outbox rows versus publication state | reclaim expired lease and publish stable event ID |
| `consumer_lease_sweep` | claimed ledger rows versus valid worker heartbeat/lease | make safely redeliverable; never mark completed without effect proof |
| `provider_reconcile` | external-effect state versus provider key/status | mark accepted/completed, schedule bounded retry, or terminally expire |
| `projection_verify` | aggregate version versus derived projection version | recompute only current/future derived state |
| `asset_integrity` | document-page metadata versus private object checksum/state | quarantine/block evidence work and alert; do not fabricate asset |

These jobs are low-priority, idempotent, and rate-limited. They do not bypass module ownership: a reconciliation job calls the owning module’s application service or emits a governed event.

## 9. `platform_0007`: activation and backfill

Activation is a deployment sequence, not a schema transaction. Introduce code that writes the outbox in the same transaction as new domain commands. Measure pending-row growth and transaction latency. Enable two relay replicas with short lease duration and stable claim token. Then enable consumers queue by queue, beginning with a reversible projection. Provider calls stay disabled until the ledger, provider-effect, and reconciliation paths have passed failure-injection tests.

Legacy jobs are not copied as opaque broker payloads. If historic work must be resumed, create controlled new outbox events from authoritative aggregate records with a migration correlation ID and idempotency scope. This preserves traceability and avoids executing stale data against new permissions, releases, or policy rules.

## 10. `platform_0008`: validation, constraints, and retention

After the compatibility period, validate non-blocking constraints where PostgreSQL version/operation permits, add selective indexes informed by real query plans, and set retention/archival policies. Outbox/ledger records should be retained long enough to cover broker redelivery, offline client retry, debugging, and the documented audit window. Archive or prune only records that no active reconciliation, recovery, legal hold, or required trace path needs.

Potential high-volume tables can be time-partitioned later, but partitioning is not a prerequisite for correctness. Introduce it only after a volume forecast and maintenance plan establish benefits. Partition creation, index builds, and backfill must be tested under concurrent API/worker load; some PostgreSQL DDL operations have distinct transaction and locking behavior.[4]

## 11. Migration acceptance matrix

| Migration stage | Blocking acceptance evidence |
|---|---|
| `platform_0001` | application/worker roles cannot bypass protected data controls; migration role separation verified |
| `platform_0002` | aggregate/audit/idempotency/outbox commit atomically; relay-off mode preserves pending rows |
| `platform_0003` | duplicate delivery produces one owned effect; expired lease cannot complete work; stale version becomes no-op |
| `platform_0004` | connection loss after provider request reconciles from deterministic key without blind resend |
| `platform_0005` | DLQ requeue creates fresh state-evaluated attempt; raw evidence/tokens absent from recovery rows |
| `platform_0006` | reconciliation recovers stuck relay/lease/unknown outcome without corrupting current state |
| `platform_0007` | canary queue meets latency, duplicate, retry, and user-impact targets before widening |
| `platform_0008` | restore drill, retention policy, query plan, and rollback-window review completed |

## References

[1] [PostgreSQL DDL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

[2] [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

[3] [Transactional Outbox Pattern, Microservices.io](https://microservices.io/patterns/data/transactional-outbox.html)

[4] [PostgreSQL `CREATE INDEX`](https://www.postgresql.org/docs/current/sql-createindex.html)
