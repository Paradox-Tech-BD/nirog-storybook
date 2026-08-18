# Implementation and Evolution Architecture

## 1. Implementation sequence

The architecture is designed to be implemented in a sequence that proves safety and ownership before adding high-variance automation. Each stage produces executable contracts, migrations, test evidence, and operational readiness artifacts. A stage is not complete merely because endpoints exist.

| Stage | Primary delivery | Required proof before progressing |
|---|---|---|
| 1. Foundation | Module skeleton, typed IDs/errors, OIDC actor mapping, profile capability, database roles/RLS test harness, audit/idempotency/outbox primitives. | BOLA, RLS reset, idempotency, audit-redaction, transaction/outbox atomicity tests. |
| 2. Identity and catalog | Account/profile/grant/consent/device flows; source/import/curation/release/index contracts. | Grant/revocation, release immutability, source checksum, index/release compatibility tests. |
| 3. Evidence boundary | Restricted upload/manifest, scan job/stage manifest, basic manual fallback and review payload. | No raw queue/log leakage, cancel/purge, fingerprint lineage, worker ownership tests. |
| 4. Regimen and adherence | Manual + evidence-assisted Regimen commands, schedule policy, occurrence projection, dose/inventory/refill events. | Confirmation/manual provenance, version conflicts, historical-dose preservation, reminder-not-dose tests. |
| 5. Mobile/notification | Offline intent/change feed, device lifecycle, deterministic notification delivery telemetry. | Duplicate/conflict/revocation sync, provider-unknown reconciliation, no dose inference. |
| 6. ML and quality | Approved model/prompt/policy/catalog/index releases, evaluation harness, progressive rollout, failure/manual posture. | Calibration/coverage/correction evidence, safe policy routing, rollback and release provenance. |
| 7. Operations maturity | Dashboards, alerts, runbooks, backups/restores, retention/purge, capacity review, incident simulation. | Recovery/rebuild drill, replay/DLQ protocol, retention/hold test, staged-load evidence. |

## 2. Migration and compatibility discipline

Physical migrations are module-owned and append-only. Cross-module effects require an announced compatibility window. Additive schema/configuration changes ship before code that requires them; backfills are bounded, resumable, idempotent, observable, and safe to stop. Activation follows validation. Contract/removal occurs only after old consumers, retry queues, stale mobile versions, and retained recovery records no longer depend on the old representation.

For async control state, the platform migration sequence begins with runtime-role separation; adds `platform.outbox_events`; adds `platform.consumer_ledger` lease/retry state; adds provider intent, DLQ/recovery, and reconciliation records; then progressively activates relay and consumers behind safe flags. The broker never becomes migration authority.[1]

## 3. Test architecture

| Test level | Contract that must hold |
|---|---|
| Domain/unit | State transition, policy truth table, release/version/fingerprint construction, event schema. |
| Repository/integration | Unique/FK/check constraints, RLS scope, optimistic lock, migration compatibility, redacted audit. |
| API/mobile | OIDC validation, profile BOLA, idempotency, stale conflict, offline replay, sync revocation/tombstone. |
| Worker/provider | Duplicate delivery, lease expiry, retry classification, external uncertainty, current-state recheck, DLQ recovery. |
| End-to-end | Upload/review/manual-to-regimen, schedule/dose/refill, catalog publication, consent revoke, retention/purge, restore/rebuild. |
| Release/operations | Evaluation approval, canary/rollback, alert/runbook, backup restoration, capacity and failure injection. |

## 4. Evolution and extraction criteria

The modular monolith is intentionally the MVP deployment shape. An extraction is justified only when observed operational ownership, independent scale, security isolation, deployment cadence, or failure domain cannot be managed within separate processes/queues and one PostgreSQL authority. A future extracted service must keep its owner contract, versioned interface, data/release provenance, recovery model, and migration/operational evidence. Splitting a module does not relax authorization, user-confirmation, or outbox/idempotency rules.

Potential early candidates are high-cost ML execution and catalog indexing because their resource profile differs from API traffic. They remain adapters/worker pools first. A new service/database boundary requires explicit cost, latency, data ownership, consistency, recovery, and security justification—not diagram preference.

## References

[1] [Nirog Outbox and Worker State Migrations](../technical-analysis/10-outbox-worker-state-migrations.md)

[2] [Nirog Data Change and Migration Governance](../data-management/08-data-change-and-migration-governance.md)

[3] [Strangler Fig Pattern, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/strangler-fig.html)
