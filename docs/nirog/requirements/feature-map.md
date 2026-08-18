# Backend Feature Map

**Status:** Proposed baseline • **Scope:** MVP through hardening • **Source:** Whitepaper analysis

The backend is organized around narrow domain boundaries. The public mobile API is stable across these modules; the ML worker and catalog/index can evolve independently behind typed contracts.

| Domain | MVP features | Subfeatures and acceptance condition | Priority |
|---|---|---|---|
| Identity and profile governance | Account, profile, membership, consent. | Explicit profile selection; scoped roles; revocation; sensitive-access audit. No client-supplied `userId` controls scope. | P0 |
| Prescription evidence | Multi-page document intake and protected assets. | MIME/size/pixel validation; page ordering; content hash; signed worker reads; retention/deletion state. A document can be saved before ML completes. | P0 |
| Scan orchestration | Asynchronous ML job lifecycle. | Idempotent create command; stage attempts; retry and dead-letter states; progress events; cancellation; materialized current status. | P0 |
| ML evidence and review | OCR result, extraction candidates, image regions, user decision. | Preserve raw result, parsed result, version manifests, candidate evidence, and immutable review decision. Unreviewed output never activates a regimen. | P0 |
| Medicine catalog | Bangladesh product/ingredient/manufacturer catalogue and search. | Release/version provenance; active/inactive status; forms/strengths; aliases; private unresolved medicine path; curator review. | P0 |
| Regimen | Accepted personal medication course and versioned dosage instructions. | One prescription line may become zero or one accepted course; changes create a new regimen version; no silent critical-field overwrite. | P0 |
| Reminders and dose events | Canonical schedule, local-notification contract, dose-event ledger. | Timezone-aware schedule specification; independently logged notification/dose states; inference rules; append-only corrections. | P1 |
| Offline sync | Device command ingestion and change feed. | Client-event idempotency; cursors; version preconditions; conflict payload; deterministic replay. | P1 |
| Inventory and refill | Advisory remaining-supply estimate. | Product base unit, package/dispense/movement entries, confidence, threshold, and acknowledgement. Do not treat it as dispensing truth. | P2 |
| Curation and active learning | Alias suggestions, review queue, controlled publication. | Profile-private feedback by default; reviewer decision; independent evidence; catalog/index release and rollback. | P1 |
| Operations and governance | Evaluation, observability, cost, audit, data lifecycle. | Model/prompt/index registry; metrics segments; kill switch; budget guardrails; deletion workflow; incident ledger. | P0 |

## Deferred capabilities

Interaction checking, clinical education, medication substitution, provider/clinic verification, pharmacy automation, insurance adjudication, and physician-specific personalization are **later** capabilities. Each needs a separate data-authority and safety case. They must not be implied by the current data model or UI.

## Delivery sequence

| Release | Outcome | Exit condition |
|---|---|---|
| Foundation | Profiles, access policy, audit, catalog import skeleton, manual regimen. | A user can securely create and manage a manual regimen without OCR. |
| Evidence loop | Document intake, job orchestration, review UI/API, evidence retention. | A scan reaches review state and can be partially accepted or discarded without creating unsafe schedules. |
| Matching loop | Search/retrieval, candidate ranking, catalog provenance, review feedback. | Candidate lists show product compatibility and origin; high-confidence means preselected, not auto-activated. |
| Adherence loop | Versioned regimen, local schedule contract, dose ledger, sync. | Offline events replay exactly once; historical adherence is stable after regimen edits. |
| Hardening | Curation, release governance, dashboards, quotas, retention and incident controls. | Quality, security, rollback, and lifecycle criteria are exercised in test and release drills. |
