# Design Workflows References

The Nirog Design Workflows root is an implementation-oriented synthesis of internal architecture decisions and the references below. The external sources provide workflow, provenance, privacy, mobile-health, and reliability principles; they do not turn Nirog into a full EHR/FHIR implementation or determine local regulatory obligations by themselves.

| ID | Source | Workflow relevance |
|---|---|---|
| WF-1 | [HL7 FHIR R5 Workflow Overview](https://hl7.org/fhir/workflow.html) | Informs explicit workflow states, allowed actions, dependencies, and request/event/definition relationships. |
| WF-2 | [HL7 FHIR R5 Provenance](https://www.hl7.org/fhir/provenance.html) | Informs source/activity/agent/version lineage for evidence, review, confirmation, release, and recovery. |
| WF-3 | [HL7 FHIR R5 Consent](https://hl7.org/fhir/R5/consent.html) | Informs purpose-, recipient-, and time-bound consent direction for future exchange and policy workflows. |
| WF-4 | [NIST Privacy Framework](https://www.nist.gov/privacy-framework) | Informs privacy as a lifecycle and risk-management concern across workflow boundaries. |
| WF-5 | [NIST SP 1800-1: Securing Electronic Health Records on Mobile Devices](https://www.nccoe.nist.gov/publication/1800-1/VolE/) | Informs layered mobile access, audit, recovery, retention, backup, and lost-device workflows. |
| WF-6 | [Mobile Apps for Increasing Treatment Adherence: Systematic Review](https://www.jmir.org/2019/6/e12505/) | Provides context for careful medication-adherence app workflow design; reminders and dose interpretation remain separate. |
| WF-7 | [Transactional Outbox Pattern, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) | Informs command commit, durable outbox publication, and deferred reliable effects. |
| WF-8 | [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) | Supports RLS as defense in depth for profile-scoped workflows. |
| WF-9 | [OWASP API1:2023 Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) | Supports server-side resource/profile authorization in every workflow. |

## Internal Nirog design anchors

| Document | Workflow relationship |
|---|---|
| [`../technical-analysis/00-system-architecture.md`](../technical-analysis/00-system-architecture.md) | Modular ownership, FastAPI/outbox/worker runtime, event envelope. |
| [`../technical-analysis/01-user-management.md`](../technical-analysis/01-user-management.md) | Identity, profiles, caregiver grants, consent, OIDC, RLS, device controls. |
| [`../technical-analysis/02-medicine-catalog.md`](../technical-analysis/02-medicine-catalog.md) | Catalog curation, releases, search/matching. |
| [`../technical-analysis/03-ml-evidence-safety.md`](../technical-analysis/03-ml-evidence-safety.md) | Evidence stages, review safety, policy gate. |
| [`../technical-analysis/04-async-workers.md`](../technical-analysis/04-async-workers.md) | Outbox, workers, retries, DLQ, notification, schedule, and sync. |
| [`../technical-analysis/05-api-persistence-security.md`](../technical-analysis/05-api-persistence-security.md) | API conventions, persistence, authorization, classification, adapters. |
| [`../technical-analysis/06-operations-deployment.md`](../technical-analysis/06-operations-deployment.md) | Operations, deployment, backup/recovery, capacity and incident control. |
| [`../data-management/README.md`](../data-management/README.md) | Data ownership, lifecycle, provenance, access, retention and recovery. |
| [`../pre-analysis/architecture/ml-pipeline-contract.md`](../pre-analysis/architecture/ml-pipeline-contract.md) | Canonical ML stage and manifest contract. |
