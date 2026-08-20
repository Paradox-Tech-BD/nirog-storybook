# Manual Medication API and Security Contract

**Status:** implemented, verified, and deployed as Core commit `2acf528`  
**Scope:** manually entered medication data only. Prescription evidence, image upload, OCR extraction, and ML review remain outside this increment.

> **Authority rule:** every medication record is owned by exactly one patient profile. A platform role, team role, device registration, or consent record never permits medication visibility or mutation. Profile ownership permits medication management; delegated access is evaluated through the existing persisted `regimen.read` and `regimen.write` permission snapshots.

## 1. Resource model

| Resource | Profile binding | Purpose in this increment | Sensitive fields excluded from API responses |
|---|---|---|---|
| Medication catalog item | Global, curated, non-clinical | Optional normalized medicine identity and display metadata | Internal provenance and editorial actor metadata |
| Prescription | `profile_id` | Manual prescribing context, issuer text, and optional prescribed dates | Future evidence-object references and OCR payloads |
| Regimen | `profile_id`, `prescription_id`, `catalog_item_id` | Active or archived medication instruction with dose/unit | Audit/outbox internals |
| Dose schedule | `regimen_id` | Local-time recurrence and timing instruction | None beyond internal creation metadata |
| Dose log | `profile_id`, `regimen_id` | Taken, missed, skipped, or late manually recorded dose outcome | Device fingerprints, notification transport tokens, and future ML inferences |

The model deliberately avoids free-form clinical conclusions, diagnosis, or OCR confidence. A manual regimen is a patient-profile record, not a provider-verification claim.

## 2. Proposed API surface

The OpenAPI server base remains `/api/v1`. All mutations require `Idempotency-Key`; all protected endpoints require Clerk bearer authentication and return the shared success or problem envelope.

| Endpoint | Required permission | Behavior |
|---|---|---|
| `GET /profiles/:profileId/medications` | `regimen.read` | Lists active/archived regimens and safe schedule summaries for the scoped profile. |
| `POST /profiles/:profileId/prescriptions` | `regimen.write` | Creates a manual prescription context. No evidence upload or OCR job is accepted. |
| `POST /profiles/:profileId/regimens` | `regimen.write` | Creates a manually entered regimen and one or more validated schedules. |
| `PATCH /profiles/:profileId/regimens/:regimenId` | `regimen.write` | Changes permitted regimen fields or archives the regimen; never rewrites dose-log history. |
| `POST /profiles/:profileId/regimens/:regimenId/dose-logs` | `adherence.write` | Appends a manual dose outcome bound to the profile and regimen. |
| `GET /profiles/:profileId/regimens/:regimenId/dose-logs` | `adherence.read` | Lists dose-history entries in a bounded time window. |

## 3. Validation boundary

The first increment accepts dosage quantity as a positive decimal serialized canonically, a controlled dose unit, and a bounded schedule form. A schedule must use an IANA timezone inherited from the patient profile or explicitly validated at creation. Exact recurrence expansion, notification delivery, stock, refill, and adherence analytics remain later slices.

| Input rule | Enforcement |
|---|---|
| `profileId` must match the request RLS profile context | Route sets the profile scope; application authorization and PostgreSQL RLS both enforce it. |
| Regimen write requires `regimen.write` | Owner or active persisted grant snapshot only. |
| Dose-log write requires `adherence.write` | Owner or active persisted grant snapshot only. |
| Dose-log read requires `adherence.read` | Owner or active persisted grant snapshot only. |
| A regimen cannot cross profiles | Foreign keys and profile-constrained update/read policies. |
| Manual medication cannot create OCR work | No evidence URI, job identifier, model output, or OCR status is accepted in these routes. |

## 4. RLS and evidence rules

The clinical tables will have RLS enabled. Their policies will allow rows only when `profile_id = platform.current_profile_id()` and the active request account is either the profile owner or a live delegated profile grant with the relevant permission enforced in the application layer. Platform-role predicates must not appear in medication-table policies.

Every state change emits `platform.audit_events` and `platform.outbox_events` inside the same transaction. Audit/outbox payloads contain safe identifiers, action codes, and non-clinical state transitions only; they must not contain raw prescriptions, medication instructions beyond approved summary fields, device tokens, evidence content, or future OCR text.

## 5. Explicit exclusions

This increment does not implement prescription photo upload, R2 evidence records, OCR enqueueing, model selection, reconciliation UI, stock/refill calculations, reminders, notifications, administration workflows, or automatic adherence scoring. Those boundaries stay separate so manual medication data can be deployed and verified before a worker or model receives any health evidence. The next increment begins only with evidence and job-reference contracts; it does not relax this boundary.
