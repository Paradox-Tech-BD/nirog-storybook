# Nirog Unified System Architecture

## 1. Purpose

This parent folder is the single implementation-ready architecture library for the Nirog backend. It unifies the product-safety baseline, technical architecture, data-management design, detailed workflows, physical persistence contract, Flutter integration, ML evidence boundary, asynchronous recovery, security, and operations.

It does **not** replace the earlier roots. `pre-analysis` remains the product and safety rationale; `technical-analysis` contains detailed engineering decisions; `data-management` defines data ownership and lifecycle; and `design-workflows` defines stateful behavior. This library is the cross-cutting place where those decisions are reconciled and viewed as one system.

> **Architecture position:** Nirog is a modular FastAPI/Python backend with one authoritative PostgreSQL cluster, private object storage, a Redis-compatible broker/cache, dedicated Celery-compatible worker pools, OIDC/OAuth2 identity, Flutter clients, and module-owned external adapters. ML produces restricted, reviewable evidence only; a current authorized command creates or changes medication state.

## 2. Reading order

| Order | Architecture view | Primary question answered |
|---|---|---|
| `00` | [Architecture Reconciliation](00-architecture-reconciliation.md) | What was reviewed and corrected before treating this as the implementation baseline? |
| `01` | [System Context and Quality Attributes](01-system-context-and-quality-attributes.md) | Who interacts with Nirog, where are its trust boundaries, and what qualities govern the design? |
| `02` | [Runtime, Process, and Deployment Topology](02-runtime-process-and-deployment-topology.md) | Which deployable processes exist, what do they communicate with, and what scales independently? |
| `03` | [Module, Code, and Command Architecture](03-module-code-and-command-architecture.md) | Which module owns each command, repository, transaction, and external adapter? |
| `04` | [Canonical Data, Schema, and Provenance Architecture](04-canonical-data-schema-and-provenance.md) | What is authoritative, what is derived, and how do physical schemas, lineage, and RLS fit together? |
| `05` | [API, Mobile, and External Interface Architecture](05-api-mobile-and-external-interface-architecture.md) | How do Flutter, admins, object storage, OIDC, push, and provider adapters interact safely? |
| `06` | [Prescription Evidence and ML Architecture](06-prescription-evidence-and-ml-architecture.md) | How does restricted evidence move through stages, review, manual fallback, and policy release without prescribing? |
| `07` | [Event, Worker, and Consistency Architecture](07-event-worker-and-consistency-architecture.md) | How do outbox, worker leases, idempotency, provider intent, retries, DLQ, and reconciliation work together? |
| `08` | [Security, Privacy, and Governance Architecture](08-security-privacy-and-governance-architecture.md) | How are authorization, purpose, RLS, secrets, egress, audit, retention, and policy artifacts enforced? |
| `09` | [Observability, Operations, and Recovery Architecture](09-observability-operations-and-recovery-architecture.md) | How are service health, release/change, incident containment, restore, rebuilding, and capacity governed? |
| `10` | [Implementation and Evolution Architecture](10-implementation-and-evolution-architecture.md) | What is the implementation order, migration posture, test gates, and criteria for future extraction? |

## 3. Architecture views and boundaries

The folder deliberately uses several views because no one diagram can safely carry client trust, module ownership, schema ownership, evidence lineage, async recovery, and deployment behavior at the same time.

| View | Primary abstraction | Must not imply |
|---|---|---|
| Context | actors, trust zones, external systems | authorization or data ownership by a simple line alone |
| Container/runtime | processes, stores, queues, adapters | microservice deployment or independent database ownership |
| Module | business owner and allowed dependencies | direct cross-module SQL writes |
| Data | canonical record, derived projection, release/lineage, retention | permission granted merely by foreign key/reference |
| Workflow | trigger, state gate, synchronous transaction, deferred effect, recovery | worker authority to create medication state |
| Security | layered controls and egress constraints | RLS substituting for API/profile authorization |
| Operations | releases, observability, recovery, capacity | unrestricted replay or restore access |

## 4. Non-negotiable system invariants

| Invariant | Enforcement locus |
|---|---|
| An account actor is not automatically a profile authority. | OIDC validation plus server-evaluated profile capability, repository scope, and RLS. |
| ML output is evidence, not a medication action. | ML role grants, module write ownership, review payload/version checks, and Regimen command boundary. |
| A worker cannot mutate foreign business state. | Database roles, repository/module contract, and negative integration tests. |
| Published catalog releases are immutable. | Release state machine, checksum, successor release, named index/release references. |
| Database state is authoritative; delivery is at least once. | Aggregate/audit/idempotency/outbox transaction, consumer ledger, current-state recheck, reconciliation. |
| Reminder delivery is not dose evidence. | Separate notification delivery and append-only dose-event records. |
| Restricted evidence never travels in generic logs, queue payloads, or sync feeds. | Private object-store grants, minimal message references, adapter allowlists, redacted telemetry. |
| Historical meaning remains explainable. | Regimen versions, evidence/review/manifests, release IDs, audit, provenance, and retention policy. |

## 5. Canonical implementation vocabulary

The architecture uses the user-facing terms **User/Account**, **PatientProfile/Profile**, **OCRScan/ScanJob**, and **DoseEvent/DoseLog** where they aid communication. New physical database work uses the technical target names such as `identity.accounts`, `identity.patient_profiles`, `prescription.scan_jobs`, `regimen.regimens`, `adherence.dose_events`, `platform.outbox_events`, and `platform.consumer_ledger`. The complete reconciliation mapping is in [00 Architecture Reconciliation](00-architecture-reconciliation.md).

## 6. Related detailed libraries

| Need | Go to |
|---|---|
| Product rules, logical ER/class models, initial API concepts | [`../pre-analysis/`](../pre-analysis/) |
| Module-level technical specification, migration plans, platform controls | [`../technical-analysis/`](../technical-analysis/) |
| Ownership, lifecycle, lineage, retention, data quality, recovery | [`../data-management/`](../data-management/) |
| Detailed stateful user, evidence, mobile, async, privacy, and operations workflows | [`../design-workflows/`](../design-workflows/) |

## 7. Source register

The architecture uses the original Nirog decisions and the research record in [research-notes.md](research-notes.md). The complete external and internal source register is maintained in [references.md](references.md).
