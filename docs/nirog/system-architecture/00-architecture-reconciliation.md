# Architecture Reconciliation Record

## 1. Purpose and outcome

This record consolidates the review performed before creating the Unified System Architecture library. The review compared the original product and logical-schema baseline, later technical architecture, data-management model, workflow library, Storybook representation, and current `main` branch publication state.

The result is a **reconciled implementation baseline**, not a redesign of Nirog’s product boundary. The settled architecture remains a FastAPI modular monolith with PostgreSQL as authoritative state, private object storage for restricted evidence, a Redis-compatible broker and Celery-compatible worker topology, Flutter mobile clients, OIDC/OAuth2 authentication, module-owned PostgreSQL schemas, and transactional outbox delivery.

## 2. Source-of-truth hierarchy

| Decision layer | Canonical role | Examples |
|---|---|---|
| Product and safety baseline | Defines what Nirog may and may not do. | ML produces evidence; Nirog does not diagnose/prescribe; explicit confirmation creates a personal regimen. |
| Logical domain model | Defines user-facing concepts and relationships. | Account/User, PatientProfile/Profile, OCRScan/ScanJob, DoseEvent/DoseLog. |
| Technical persistence contract | Defines new physical schema names, write ownership, transactions, migrations, and runtime controls. | `identity.accounts`, `prescription.scan_jobs`, `platform.outbox_events`, `adherence.dose_events`. |
| Workflow contract | Defines triggers, current-state gates, synchronous commits, deferred work, recovery, and terminal outcomes. | evidence review, regimen command, offline intent, provider reconciliation, purge. |
| Unified System Architecture | Connects the preceding layers in one set of architecture views. | system context, module map, physical data map, API/mobile, ML, async, security, deployment. |

Logical labels remain valid in explanation and diagrams. New SQL, ORM, migrations, and application repositories use the technical persistence contract rather than copying older illustrative table names.

## 3. Reconciliations applied

| Review topic | Reconciled position | Correction applied |
|---|---|---|
| Repository source branch | `main` is the current canonical documentation branch after the merge. | Updated 21 stale Storybook GitHub source links from `next` to `main`. |
| Logical versus physical names | Pre-analysis names are conceptual; physical target names are the later technical contract. | Added an explicit mapping to the subsystem ownership document. |
| Identity device record | One physical device table represents registered installation/push state. | Standardized later references on `identity.devices`. |
| Catalog release record | Immutable releases use the technical physical target. | Standardized later references on `catalog.releases`. |
| Platform control tables | Platform records use plural physical targets. | Standardized `platform.audit_events` and `platform.outbox_events` references. |
| Evidence-assisted versus manual regimen creation | ML/evidence review is not the only product entry point; it is the only evidence-assisted entry point. | Clarified that a separate authorized manual regimen command may create a plan without a scan. |
| Evidence review ownership | A worker never creates medication state. | Clarified that the authorized review route invokes the Regimen command inside its command boundary; outbox work starts only after regimen commit. |
| Dose versus reminder semantics | Dose events record medication behavior; reminder delivery/snooze is telemetry and user interface interaction. | Removed `snoozed` from DoseEvent vocabulary and placed it in notification/reminder state. |
| Schedule execution | Server retains authoritative schedule policy and projects future occurrences; Flutter is a delivery/rendering client. | Replaced older device-side execution wording with server-owned projection and local delivery-channel semantics. |
| Planned occurrence ownership | Regimen owns schedule policy; Adherence owns derived future occurrences. | Standardized the projection target on `adherence.planned_dose_occurrences`. |

## 4. Cross-system contracts now required

### 4.1 Authority contract

OIDC validates the account actor. Nirog then computes a short-lived immutable profile capability from account state, ownership or current `identity.profile_access`, consent/purpose, requested action, resource relationship, and time. No token, profile ID, team membership, queue payload, or object UUID is authority by itself. RLS is defense in depth, not the primary decision engine.[1] [2]

### 4.2 State and provenance contract

Every mutable aggregate has an owner, integer version or equivalent state precondition, idempotency boundary, audit context, and—where an effect crosses a process boundary—outbox event. Evidence and model output additionally record document/version, input fingerprint, stage configuration, model/prompt/policy/catalog/index release, actor/activity, and raw-result reference where retention permits.

### 4.3 Deferred-effect contract

The aggregate update, audit record, idempotency result, and `platform.outbox_events` row commit together. Relays publish only committed event envelopes. Consumers use `platform.consumer_ledger`, current-state/version/policy rechecks, bounded classified retry, deterministic external-provider intent, reconciliation of unknown outcomes, and redacted recovery records. Queue delivery is at-least-once; owned durable effects are made effectively once through persistence and unique constraints.[3]

### 4.4 Medical-action contract

ML workers can create evidence, review payloads, and policy results only. The Regimen module alone writes regimen versions, schedule policy, and inventory transitions. An authorized manual command or evidence-assisted review command can invoke the Regimen module; neither a candidate score nor an asynchronous worker can activate a medication plan. Reminder delivery never proves a dose.

### 4.5 Data-lifecycle contract

Restricted evidence, raw OCR/provider output, health records, access grants, and device records have documented owner, class, purpose, retention, hold, purge, and recovery behavior. Revocation blocks new scoped access and causes dependent queued sensitive work to recheck/cancel/no-op; it does not permit uncontrolled deletion that breaks traceability or legal retention requirements.

## 5. Verification responsibilities

The architecture is only credible when tests prove its boundaries. The implementation plan therefore requires cross-module negative tests for BOLA, RLS pooled-connection reset, revoked grants during queued work, duplicate client commands, duplicate broker delivery, scan cancellation, evidence-version conflict, catalog release/index mismatch, worker attempts to write foreign tables, provider outcome uncertainty, retention hold/purge races, and rebuild after restore.

## References

[1] [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)

[2] [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

[3] [Transactional Outbox Pattern, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
