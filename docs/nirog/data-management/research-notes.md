# Data Management Research Notes

## Inputs used to shape the Nirog approach

The provided example demonstrates useful **depth**: grouping related data concerns, separating operational state from logs, and exposing relationships visually. It is not a template for Nirog. Its users, subscriptions, token ledger, generic resource processing, and BullMQ-specific tables do not match a medication-management system with restricted prescription evidence, reviewed ML output, profile-scoped consent, immutable catalog releases, and user-confirmed regimen activation.

Nirog’s own architecture establishes the key design constraints. PostgreSQL is the authoritative system of record; modules own their tables; committed cross-module work starts with a transactional outbox; restricted evidence does not travel in event payloads; and ML stages produce reviewable evidence rather than a medication regimen. The data-management set will therefore make **ownership, lineage, minimization, lifecycle, and safe reuse** its organizing principles.

## External guidance translated into design requirements

| Source | Relevant finding | Nirog data-management implication |
|---|---|---|
| [NIST Privacy Framework](https://www.nist.gov/privacy-framework) | Privacy risk should be identified and managed through enterprise risk management. | Each data class needs a stated purpose, owner, access path, retention rule, and review evidence—not only encryption. |
| [NIST SP 1800-1: Securing EHRs on mobile devices](https://www.nccoe.nist.gov/publication/1800-1/VolE/) | Mobile health information requires layered controls around authorized access, auditing, retention, backup, recovery, and lost-device scenarios. | Flutter synchronization is profile-scoped, minimal, revocable, auditable, and recoverable; the mobile client is never the system of record. |
| [HL7 FHIR Provenance](https://www.hl7.org/fhir/provenance.html) | Provenance records the entities and processes that create or influence a resource, supporting authenticity, trust, reproducibility, and lifecycle assessment. | Nirog captures source asset, transform, stage run, model/prompt/policy/catalog release, user review, and regimen-confirmation lineage. |
| [HL7 FHIR Consent](https://hl7.org/fhir/R5/consent.html) | Consent can express who may perform which action, for what purpose and duration; provenance can track consent changes. | Nirog stores consent as versioned, purpose-aware, time-bounded policy input and rechecks it at sensitive access/worker boundaries. |

## Design conclusions

The new data-management documentation should be a dedicated Nirog folder with original diagrams and implementation rules. It should treat operational logs, audit events, derived projections, raw evidence, shared catalog reference data, ML execution manifests, and user-confirmed regimen state as **different data products** with different owners and retention behavior. It should not collapse them into a single generic documents/jobs schema.
