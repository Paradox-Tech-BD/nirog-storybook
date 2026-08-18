# Unified System Architecture Research Notes

## Reliability and event publication

The [AWS Transactional Outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) describes the core dual-write risk: a database change and later event notification can diverge if they are not coupled. Its relevant design implications for Nirog are: write the owned aggregate and outbox row in one transaction; relay only committed rows; tolerate duplicate delivery; make consumers idempotent with durable processed-message state; preserve aggregate order/sequence where required; and never publish an event for a rolled-back business transaction.

Nirog applies this as `platform.outbox_events` plus `platform.consumer_ledger`, aggregate version rechecks, and deterministic provider intent/reconciliation for external effects. The architecture stays a modular monolith; it does not introduce distributed transactions or premature service-level sagas for the MVP.

## PostgreSQL authorization

The [PostgreSQL Row Security Policies documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) confirms that enabled RLS uses default-deny when no applicable policy exists, but superusers, `BYPASSRLS` roles, and normally table owners can bypass policy. It also warns that table-wide operations and referential-integrity behavior need separate consideration. Nirog therefore treats application authorization as primary and RLS as defense in depth: runtime API/worker roles must not have `BYPASSRLS`; migration/owner roles are separate; transaction-local account/profile scope is set only after policy evaluation; and policy/integration tests cover pooled-connection reset, owner bypass, and foreign-key disclosure behavior.

## Identity

The [OpenID Connect Core 1.0 specification](https://openid.net/specs/openid-connect-core-1_0.html) defines OIDC as an identity layer above OAuth 2.0 and identifies `iss`, `sub`, `aud`, and `exp` as required ID-token claims. Nirog maps the validated `(issuer, subject)` pair to a local `identity.auth_identities` record and internal `identity.accounts.id`; the token establishes an account actor, not profile authorization. Profile capability remains a separately evaluated local decision.

## Workflow, provenance, privacy, and mobile-health anchors

| Source | Unified architecture use |
|---|---|
| [HL7 FHIR Workflow](https://hl7.org/fhir/workflow.html) | Uses explicit definitions, requests, events, state, relationships, dependencies, and conditions as workflow-design concepts without requiring internal FHIR execution. |
| [HL7 FHIR Provenance](https://www.hl7.org/fhir/provenance.html) | Supports source/activity/agent/version lineage for evidence, review, confirmation, release, and recovery. |
| [NIST Privacy Framework](https://www.nist.gov/privacy-framework) | Supports privacy-risk management across collection, access, use, retention, and response. |
| [NIST SP 1800-1](https://www.nccoe.nist.gov/publication/1800-1/VolE/) | Supports mobile-health access, audit, lost-device, recovery, retention, and backup controls. |
| [Mobile Apps for Increasing Treatment Adherence: Systematic Review](https://www.jmir.org/2019/6/e12505/) | Supports careful medication-management app workflows while preserving the distinction between reminders and dose evidence. |

## Design conclusion retained for Nirog

Nirog remains a FastAPI modular monolith with a PostgreSQL cluster, Redis-compatible broker/cache, private object storage, Celery-compatible worker processes, Flutter mobile client, OIDC/OAuth2 authentication, and module-scoped external adapters. ML/model details remain configured release artifacts rather than hard-coded runtime facts. ML produces reviewable evidence only; a current authorized confirmation command creates or versions a regimen.
