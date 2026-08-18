# Quality, Security, Privacy, and Operations

**Status:** Canonical baseline • **Scope:** Required before production pilot.

## Access and API policy

Every endpoint that acts on an object identifier must evaluate permission against actor, profile, relationship grant, action, resource sensitivity, and consent context. Object identifiers are opaque UUID/ULID values, but opaque IDs are not authorization. Client-provided user identifiers must never define database scope. This directly addresses object-level authorization risk identified by OWASP.[1]

Prescription reads use short-lived, purpose-bound signed access. Intake validates declared and sniffed content type, file size, pixel dimensions, decompression risk, EXIF removal, and malware scan result. General logs exclude raw prescription text, object URL, access token, and sensitive payloads.

## Audit versus provenance

| Record | Question answered | Retention behavior |
|---|---|---|
| Provenance | How did this result/regimen reach its current state? | Immutable references to source evidence, model/catalog/policy artifacts, and contributors. |
| Audit event | Who accessed or acted on protected data, when, and from where? | Append-only and access-restricted; never a user-editable timeline. |
| Operational trace | Where did latency, retries, errors, or cost occur? | Redacted; no health content. |
| Product analytics | Is a workflow understandable and used? | Aggregate/minimized data only; not a substitute for an audit log. |

FHIR describes provenance as the record of entities and processes that influenced a resource, while AuditEvent covers operational, privacy, security, maintenance, and performance-relevant events.[2] [3]

## Offline and concurrency protocol

Each mutation is an immutable client command containing `client_event_id`, device id, profile id, entity id, base version/cursor, local occurred time, payload, and idempotency scope. The server records exactly one accepted/rejected resolution per command. Clients fetch ordered changes with a server cursor. Medication-critical changes create a new regimen version and can return a conflict requiring review; benign preference changes may use last-write-wins.

Past planned doses are not retroactively reinterpreted when a regimen changes. The ledger records user-reported `taken` or `skipped`, system-inferred `missed`, `snoozed`, and `unknown` separately. Notifications remain independent events. A local schedule being created does not prove notification delivery, acknowledgement, or ingestion.

## Data lifecycle

Raw prescription images have a documented short default retention. Derived OCR, user review, feedback, embedding/cache, backup, analytics, and audit records have separate lifecycle categories. Training or fine-tuning use of identifiable source images is off by default and requires a distinct, revocable consent record and a policy for downstream model artifacts. Account deletion creates a tracked purge job with statuses for active data, object storage, derived artifacts, caches, and permitted retained records.

## Operational controls

| Control | Requirement |
|---|---|
| Cost | Per-user scan quota, rolling budget, provider usage telemetry, circuit breaker, queue backpressure, and cache metrics. |
| Reliability | Idempotent command and job boundaries, exponential retry, dead-letter queue, replay tooling, and status page/error taxonomy. |
| Observability | Correlated request/job trace id; stage timing; quality-policy outcome; catalog/model release; redacted error code. |
| Release governance | Approved artifacts, evaluation report, rollout cohort, rollback plan, and incident owner for every material ML/catalog/policy release. |
| Security verification | Automated object-level and function-level authorization-negative tests, signed-URL tests, tenant/profile isolation tests, dependency scanning, and secret scanning. |
| Curation | Least-privilege curator roles, review queue, dual review for shared high-impact edits, source provenance, release diff, and rollback. |

## References

[1] [OWASP, *API1:2023 Broken Object Level Authorization*](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)

[2] [HL7 FHIR, *Provenance*](https://hl7.org/fhir/provenance.html)

[3] [HL7 FHIR, *AuditEvent*](https://hl7.org/fhir/auditevent.html)
