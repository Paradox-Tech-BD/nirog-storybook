# Unified System Architecture References

## Internal Nirog sources

| Reference | Architecture contribution |
|---|---|
| [`../pre-analysis/final-coherence-check.md`](../pre-analysis/final-coherence-check.md) | Product boundary, logical vocabulary, subsystem ownership, deferred decisions. |
| [`../pre-analysis/schemas/domain-schema.md`](../pre-analysis/schemas/domain-schema.md) | Logical entities, invariants, provenance, core relationship model. |
| [`../technical-analysis/README.md`](../technical-analysis/README.md) | Technical-analysis taxonomy and design posture. |
| [`../technical-analysis/00-system-architecture.md`](../technical-analysis/00-system-architecture.md) | Modular runtime, event envelope, reliability baseline. |
| [`../technical-analysis/03-ml-evidence-safety.md`](../technical-analysis/03-ml-evidence-safety.md) | Stage contracts, trust zones, review/activation gate. |
| [`../technical-analysis/04-async-workers.md`](../technical-analysis/04-async-workers.md) | Worker topology, outbox, ledger, retry, DLQ, projection and sync. |
| [`../technical-analysis/05-api-persistence-security.md`](../technical-analysis/05-api-persistence-security.md) | API, persistence, authorization, classification, adapters, tests. |
| [`../technical-analysis/06-operations-deployment.md`](../technical-analysis/06-operations-deployment.md) | Environment, deployment, observability, backup/recovery, capacity. |
| [`../data-management/README.md`](../data-management/README.md) | Data ownership, lifecycle, quality, retention, recovery, migration. |
| [`../design-workflows/README.md`](../design-workflows/README.md) | Detailed stateful workflow and safety-gate behavior. |

## External sources

| ID | Source | Architecture use |
|---|---|---|
| SA-1 | [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) | Identity token/issuer/subject/audience/expiry validation. |
| SA-2 | [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) | RLS default-deny behavior and owner/bypass caveats. |
| SA-3 | [Transactional Outbox Pattern, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) | Atomic domain/outbox write, duplicate delivery, idempotent consumer, ordering concerns. |
| SA-4 | [Celery Task Documentation](https://docs.celeryq.dev/en/stable/userguide/tasks.html) | Idempotent tasks, retry, routing, acknowledgements, sensitive arguments. |
| SA-5 | [HL7 FHIR Workflow](https://hl7.org/fhir/workflow.html) | Explicit workflow state/request/definition/dependency concepts. |
| SA-6 | [HL7 FHIR Provenance](https://www.hl7.org/fhir/provenance.html) | Source, activity, agent, and revision lineage concepts. |
| SA-7 | [NIST Privacy Framework](https://www.nist.gov/privacy-framework) | Privacy-risk management across lifecycle/egress/response. |
| SA-8 | [NIST SP 1800-1](https://www.nccoe.nist.gov/publication/1800-1/VolE/) | Mobile-health security, audit, recovery, retention, and backup considerations. |
| SA-9 | [OWASP API1:2023 BOLA](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) | Object-level authorization test requirements. |

The external sources support design principles and implementation controls. They do not determine local clinical, privacy, data-region, retention, provider-agreement, or regulatory obligations; those require applicable legal, organizational, and product-owner review.

