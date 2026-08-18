# Data Management References

The Nirog data-management approach is implementation guidance for the proposed FastAPI/PostgreSQL/Flutter architecture. These references inform its privacy-risk, mobile health, provenance, consent, database, and event-reliability principles. They do not by themselves determine regulatory obligations for a particular deployment jurisdiction.

| ID | Source | Relevance to Nirog |
|---|---|---|
| DM-1 | [NIST Privacy Framework](https://www.nist.gov/privacy-framework) | Treats privacy risk as an enterprise risk-management concern and informs purpose, minimization, access, lifecycle, and governance decisions. |
| DM-2 | [NIST SP 1800-1: Securing Electronic Health Records on Mobile Devices](https://www.nccoe.nist.gov/publication/1800-1/VolE/) | Informs defense in depth for mobile health information, including access, audit, retention, backup, recovery, and lost-device scenarios. |
| DM-3 | [HL7 FHIR R5 Provenance](https://www.hl7.org/fhir/provenance.html) | Informs source/activity/agent/release lineage and the distinction between provenance and access audit. |
| DM-4 | [HL7 FHIR R5 Consent](https://hl7.org/fhir/R5/consent.html) | Informs purpose- and time-bound consent representations and computable policy direction for future interoperability. |
| DM-5 | [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) | Supports RLS as defense in depth for profile-scoped database records. |
| DM-6 | [PostgreSQL Documentation: Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) | Informs command concurrency, locks, optimistic versions, and migration/backfill behavior. |
| DM-7 | [Transactional Outbox Pattern, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) | Informs committed event publication and recovery of asynchronous effects. |
| DM-8 | [OWASP API Security Top 10: Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) | Supports server-side object/profile authorization on every resource access. |

## Internal Nirog source documents

| Document | Relationship |
|---|---|
| [`../technical-analysis/00-system-architecture.md`](../technical-analysis/00-system-architecture.md) | Module ownership, runtime boundaries, event envelope, and outbox baseline. |
| [`../technical-analysis/03-ml-evidence-safety.md`](../technical-analysis/03-ml-evidence-safety.md) | Evidence-stage safety, user review, and restricted ML work boundary. |
| [`../technical-analysis/04-async-workers.md`](../technical-analysis/04-async-workers.md) | Outbox, consumer ledger, retries, DLQ, scheduled/reconciliation worker behavior. |
| [`../technical-analysis/05-api-persistence-security.md`](../technical-analysis/05-api-persistence-security.md) | API, PostgreSQL, RLS, classification, adapter, and testing baseline. |
| [`../technical-analysis/06-operations-deployment.md`](../technical-analysis/06-operations-deployment.md) | Backup, recovery, observability, deployment, and capacity governance. |
| [`../pre-analysis/architecture/ml-pipeline-contract.md`](../pre-analysis/architecture/ml-pipeline-contract.md) | Canonical evidence-stage and execution-manifest contract. |
