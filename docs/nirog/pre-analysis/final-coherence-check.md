# Final General Pre-Analysis Coherence Check

**Status:** Completed general pre-analysis. **Technical analysis:** intentionally deferred until the product owner explicitly authorizes the next phase.

## 1. Purpose of this check

The work completed so far establishes the **product, safety, domain, and interaction baseline** for Nirog. It is not yet a backend implementation specification, database migration plan, service code design, or deployment runbook. This final check confirms that the pre-analysis is internally coherent enough to become the input to a later technical-analysis phase.

> **Pre-analysis conclusion:** Nirog is a prescription-evidence and medication-management product. It may use ML to extract and organize evidence, but an authorised user must confirm a medication instruction before the system activates a personal regimen or schedule.

## 2. Coherent product baseline

| Area | Settled general-analysis position | Main reference |
|---|---|---|
| Product boundary | Nirog organizes prescription evidence, medication routines, reminders, adherence events, and advisory refill tracking. It does not diagnose, prescribe, or silently infer an active therapy. | `requirements/product-safety.md` |
| Primary user context | An authenticated account may own or receive explicit access to one or more patient/dependent medication profiles. | `architecture/subsystem-architecture.mdx` |
| Evidence rule | An uploaded prescription is preserved as restricted source evidence. OCR text, extracted fields, and candidate matches remain reviewable evidence rather than accepted clinical facts. | `architecture/ml-pipeline-contract.md` |
| Catalog rule | Shared medicine data is a versioned, curated reference catalog. A catalog product is distinct from an individual’s regimen. | `adr/0003-versioned-catalog-with-curated-shared-learning.md` |
| Regimen rule | A confirmed personal medication course is versioned. Critical instruction changes create a new version so prior dose events remain interpretable. | `adr/0002-user-confirmed-regimen-activation.md` |
| Adherence rule | Reminder delivery does not prove medication consumption. User-reported dose events and system-inferred misses remain distinct. | `schemas/domain-schema.md` |
| Privacy and authority | Access is profile-scoped, explicit, revocable, and server-enforced. Consent, audit, provenance, retention, and deletion are first-class product responsibilities. | `operations/quality-security-operations.md` |
| ML governance | Model, prompt, policy, catalog, and index releases are separately versioned so materialized results can be traced to the conditions that produced them. | `references/research-notes.md` |

## 3. Canonical vocabulary

The pre-analysis uses the following vocabulary consistently. A later technical phase may choose different physical table or API names, but it must preserve these distinctions.

| Concept | Meaning in Nirog | Must not be conflated with |
|---|---|---|
| **Account/User** | Authenticated application actor. `User` is the user-facing term; `account` may be the physical persistence term. | A patient/dependent medication profile. |
| **PatientProfile/Profile** | The patient or dependent medication-management context. `PatientProfile` is the user-facing term; `profile` may be the physical persistence term. | A device, team, account, or catalog product. |
| **PrescriptionDocument** | Restricted source record containing one or more uploaded pages. | An OCR scan result or a regimen. |
| **OCRScan / ScanJob** | Asynchronous processing attempt with stages and release provenance. | A user confirmation. |
| **ExtractedMedicationLine** | Evidence-bound extraction record for a possible medicine instruction. | An accepted catalog product or active regimen. |
| **MedicineProduct** | Shared, release-bound reference-catalog identity. | A patient’s personal medication course. |
| **MedicationRegimen / RegimenItem** | Profile-private confirmed medication course with a current version. | A catalog product or raw prescription evidence. |
| **RegimenVersion** | Immutable dosage/timing version for a regimen. | A mutable overwrite of historical instructions. |
| **DoseEvent / DoseLog** | Append-only report of taken, skipped, snoozed, late, or inferred-missed state. | A notification delivery record. |
| **Notification / ReminderDelivery** | Delivery, acknowledgement, snooze, expiry, and device telemetry. | Proof of medication consumption. |

## 4. Subsystem interaction baseline

The general pre-analysis is organised around six bounded subsystems. These are logical ownership groups for the MVP, not a requirement to deploy six microservices.

| Subsystem | Owns | Receives | Produces |
|---|---|---|---|
| User Management | Accounts, access grants, profiles, teams, devices, preferences, consent. | Authentication input and sharing actions. | Effective profile access, device/timezone preferences, audit context. |
| Medicine Catalog | Products, ingredients, aliases, sources, releases, match indexes. | Curated source data and normalized search hints. | Release-bound product lookup and candidate identities. |
| Prescription and ML Evidence | Documents, pages, scan jobs, stage runs, OCR lines, extracted fields, candidate evidence, reviews. | Uploaded source files, profile scope, catalog candidates. | Review payloads and confirmed-review commands. |
| Medication Regimen | Private medication courses, versions, schedules, inventory movements, refill rules. | Confirmed review decision, user edits, dose/refill outcomes. | Activated schedule and refill-policy changes. |
| Adherence and Notifications | Reminder delivery, notifications, dose events, refill alerts/history, adherence projections. | Schedule changes, device preferences, user reports. | Dose/refill outcomes, notification state, sync changes. |
| Cross-Cutting Platform | Idempotency, audit, provenance, change feeds, release artifacts, purge jobs. | Commands and events from all ownership groups. | Traceable operational history and policy-filtered deltas. |

## 5. Preconditions satisfied before technical analysis

The following strategic decisions are sufficiently defined to start technical analysis later.

1. The product has an evidence-preserving and human-confirmed medication activation boundary.
2. The core user, caregiver, profile, catalog, prescription, regimen, reminder, adherence, and offline-sync concepts have clear ownership.
3. The proposed API and logical schema cover the primary product workflow from document upload through review, regimen activation, reminders, dose events, and synchronization.
4. ML output is treated as explainable evidence with model, prompt, policy, catalog, and index provenance.
5. The documentation provides a modular-monolith starting point with a clear extraction boundary for ML work and catalog curation.

## 6. Technical-analysis handoff

Technical analysis begins **only after an explicit instruction from the product owner**. It should not revisit the product boundary without a stated change request. It will convert this pre-analysis into implementable decisions in the following order.

| Technical-analysis stream | Questions to resolve next | Expected output |
|---|---|---|
| Runtime and deployment | Final hosting, environment separation, secret model, background worker topology, object storage, queue, and database operations. | Deployment topology and environment contract. |
| Backend module design | FastAPI module boundaries, dependency rules, command handlers, repository contracts, transaction/outbox behavior, and error model. | Code/package architecture and command-flow specification. |
| Persistence design | PostgreSQL schema, keys, constraints, indexes, JSON fields, migrations, retention jobs, encryption boundaries, and query plans. | Physical ERD and migration-ready schema. |
| API implementation | Endpoint completion, authentication middleware, policy enforcement, request/response validation, pagination, problem details, and OpenAPI conformance tests. | Versioned implementation API specification. |
| ML pipeline engineering | Worker interface, queue semantics, input validation, stage contracts, model adapters, calibration artifacts, retries, dead-letter handling, and evaluation automation. | ML processing and release-engineering design. |
| Flutter integration | Offline command queue, client IDs, sync cursor behavior, upload/retry workflow, local notifications, and conflict UI rules. | Mobile-backend integration contract. |
| Security and operations | Threat model, authorization test matrix, audit fields, observability, backups, deletion execution, incident runbooks, and release gates. | Security/operations design pack. |

## 7. Deferred decisions to bring into technical analysis

The following are deliberately recorded as inputs to the next phase rather than decided in this general pre-analysis: the chosen cloud/vendor stack; the production identity provider; database service and data-region policy; exact object-storage and malware-scanning provider; queue/worker technology; model hosting/provider and GPU policy; legal review of consent and retention; catalog-source agreements; and the final user-interface behavior for unresolved or ambiguous instructions.

## 8. Maintenance and scope guard

New work remains in this **pre-analysis** folder until the product owner says to begin technical analysis. Once technical analysis starts, new technical documents should be created under `docs/nirog/technical-analysis/` and must link back to the specific pre-analysis decision, user flow, schema concept, or safety boundary that they refine. This preserves a visible line between *why the system exists and how it should behave* and *how it will be built*.
