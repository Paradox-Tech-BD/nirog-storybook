# Presentation Script: Nirog Technical Analysis Overview

**Audience:** Backend engineers, mobile engineers, platform engineers, product stakeholders, and technical advisors.  
**Suggested duration:** 10–12 minutes.  
**Purpose:** Explain how the approved Nirog product boundaries become a secure, asynchronous, deployable backend architecture.

## Cover

**Title:** Nirog Technical Architecture  
**Subtitle:** A safe, modular backend for evidence-assisted medication management

**Speaker script:**

“This presentation moves from Nirog’s product and safety decisions into the technical architecture that will implement them. The central question is how to support useful prescription assistance, medication plans, reminders, caregiver access, and mobile synchronization without allowing uncertain automation to become an uncontrolled medication action.”

## Slide 1

**Title:** One Backend, Clear Ownership

**On slide:**

- Start with a modular FastAPI backend, not premature microservices.
- Keep one authoritative PostgreSQL cluster and explicit schema ownership.
- Use separate worker processes for all delayed, costly, or provider-dependent work.

**Speaker script:**

“Nirog starts as a modular monolith. This provides a coherent transaction boundary and a simpler operating model while the product is still evolving. The architecture is not a single undifferentiated codebase: each module owns its commands, tables, policies, APIs, and events. We separate worker processes by workload because asynchronous isolation matters now, even before we need separate deployable business services.”

## Slide 2

**Title:** Modules Own Their Own Decisions

**On slide:**

- User Management owns accounts, profiles, caregiver grants, consent, and devices.
- Catalog owns shared medicine facts, curation, releases, and match indexes.
- Evidence owns documents, scans, extraction, candidates, and review payloads.
- Regimen and Adherence own confirmed plans, schedules, dose events, and delivery state.

**Speaker script:**

“The key engineering discipline is ownership. A module does not write another module’s business tables. It either calls an explicit command service or consumes a versioned event. That prevents catalog data becoming patient history, prevents a scan worker from creating therapy, and gives every table family a clear policy and migration owner.”

## Slide 3

**Title:** Every Command Has One Reliable Path

**On slide:**

- Authenticate and authorize the actor and active profile.
- Validate and commit one module-owned state transition.
- Persist audit, idempotency response, and outbox event in the same transaction.
- Return the committed resource or an accepted job reference.

**Speaker script:**

“A request does not wait for OCR, a push provider, or an index build. It authorizes the user, applies one durable domain transition, and writes its outbox event in the same transaction. This removes the dangerous gap where the database says something happened but a background action was never triggered. Any long-running effect begins only after the authoritative transaction commits.”

## Slide 4

**Title:** ML Produces Evidence, Not Therapy

**On slide:**

- Stage workers preserve source-to-result lineage.
- Models return reviewable fields and catalog candidates with release metadata.
- A policy routes confidence into review, correction, manual entry, or safe failure.
- Only an authenticated confirmation command can create a regimen version.

**Speaker script:**

“The ML boundary is the most important safety boundary in the design. Workers can process a document and produce evidence: recognized lines, extracted fields, compatible medicine candidates, and a review outcome. But an ML worker cannot write regimen, adherence, reminder, inventory, or notification state. A medication plan exists only after an authorized person confirms a reviewed payload.”

## Slide 5

**Title:** Asynchrony Is Designed for Failure

**On slide:**

- Transactional outbox publishes committed events after database commit.
- Consumer ledger deduplicates at-least-once delivery.
- Retry is classified: transient, stale, permanent, policy, capacity, or unknown provider outcome.
- DLQ recovery re-evaluates current authoritative state instead of replaying stale payloads.

**Speaker script:**

“We treat duplicate delivery and worker interruption as normal operating conditions. A worker claims an event, reads current state, applies only its owned effect, and commits completion with any next outbox event. Temporary faults use a bounded backoff. Corrupt input, revoked permission, stale work, and incompatible contracts stop safely. When a provider response might have been lost after acceptance, we reconcile through a deterministic request key before we consider a resend.”

## Slide 6

**Title:** Identity Is Not Permission

**On slide:**

- OIDC verifies the account identity and constructs a backend actor context.
- Server policy evaluates profile ownership, caregiver grant, consent, and permission per action.
- Resource relations, repository scoping, and PostgreSQL RLS form successive fences.
- Worker identities are scoped to their queues, tables, assets, and network egress.

**Speaker script:**

“Authentication establishes who is calling. It does not establish which patient data they may access. Every profile-scoped request receives a current server-side permission evaluation. This matters especially for caregiver access and revocation. Database row security reinforces the application policy, while workers have their own service identities rather than receiving user tokens or broad health-data access.”

## Slide 7

**Title:** Evidence and Shared Facts Stay Separate

**On slide:**

- Prescription assets and raw OCR output are restricted evidence.
- Private object storage uses short-lived, purpose-bound capabilities.
- Shared catalog releases are immutable and reproducible.
- Corrections create curated successor releases instead of silent global edits.

**Speaker script:**

“The system has two very different data worlds. Restricted evidence is profile-scoped and protected through private storage, narrow capabilities, and redacted telemetry. Catalog data is shared reference information, but it is release-bound. This lets a historical review be explained using the catalog and index release that existed at the time, while corrections travel through an explicit curation and publication process.”

## Slide 8

**Title:** Scale Workloads Independently

**On slide:**

- API replicas scale by concurrency, latency, and database-pool capacity.
- ML workers scale by queue age, task duration, provider quota, GPU capacity, and budget.
- Projection, notification, catalog, and maintenance workers use independent queues and limits.
- Backpressure protects core medication workflows during expensive-work saturation.

**Speaker script:**

“We scale workload classes, not every domain as a separate network service. The API is stateless and scales differently from image processing, ML inference, notification dispatch, or catalog indexing. Backpressure is intentional. If inference capacity is constrained, Nirog delays or limits new noncritical scans and keeps manual entry, existing regimen management, and dose recording available.”

## Slide 9

**Title:** Release Artifacts Are Versioned

**On slide:**

- Code, migrations, API events, workers, catalog/index, and ML policy have compatibility rules.
- Schema changes use expand, migrate, and contract stages.
- ML/parser/prompt/index changes require evaluation and canary release.
- Rollback changes active releases for future work; it does not rewrite evidence history.

**Speaker script:**

“The system distinguishes an application deployment from a catalog release or a model-policy release. Every release has an explicit compatibility and rollback story. That makes it possible to test a new parser, index, or confidence policy without silently changing the meaning of existing evidence. Database changes are deliberately backward-compatible through the migration window.”

## Slide 10

**Title:** Operations Measure Safety and Timeliness

**On slide:**

- Traces link command, outbox event, worker attempt, provider call, review payload, and user decision.
- Dashboards measure API health, queue age, retry/DLQ rate, delivery state, and release outcomes.
- Backups, point-in-time recovery, retention jobs, and restoration drills protect authoritative state.
- Logs remain redacted: no raw images, OCR text, tokens, or full health payloads.

**Speaker script:**

“Operations are part of the architecture. The platform must tell us whether a user is waiting too long for a review, whether a worker queue is stuck, whether a provider is degrading, or whether a release changes correction behavior. Recovery is built around PostgreSQL, the outbox, task ledgers, and release manifests—not around trusting stale broker messages or logs.”

## Slide 11

**Title:** Build the Safe Core First

**On slide:**

- Establish identity, profile policy, audit, idempotency, and module boundaries.
- Build regimen and adherence from explicit user commands.
- Add evidence stages behind immutable review payloads and confirmation gates.
- Expand automation only after evaluation, observability, and manual fallback are proven.

**Speaker script:**

“The implementation sequence follows the risk boundary. First we build trust, ownership, and the user-recorded medication core. Then we add catalog release behavior and asynchronous projections. ML arrives as reviewable evidence behind strict confirmation, evaluation, and rollback controls. This gives Nirog a practical path to useful assistance while preserving user control and engineering reliability.”

## Closing

**Title:** Reliable Assistance, Controlled Action

**On slide:**

Nirog makes uncertain prescription information reviewable, traceable, and user-confirmed before it affects a medication plan.

**Speaker script:**

“The technical architecture is designed to help without overreaching. It separates evidence from action, identity from permission, and durable state from asynchronous delivery. Those boundaries give us a backend that can evolve in capability while remaining explainable, secure, and dependable for medication-management workflows.”
