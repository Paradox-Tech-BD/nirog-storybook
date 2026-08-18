# Design Workflows Research Notes

## Reference-material boundary

The supplied example is a broad workflow catalog for a different AI study product. It is useful as a benchmark for explicit actors, state transitions, retry paths, and operational workflows. It is not a Nirog template: its Firebase authentication, credit ledger, payments, document/RAG study sets, browser exam assistance, BullMQ tables, and content-moderation model do not belong in Nirog unless independently approved.

Nirog workflow documentation therefore uses the example only for **depth and diagram discipline**. Its workflow library is organized around medication-management domain actions, restricted evidence, user review, profile authorization, immutable catalog releases, dose/adherence records, Flutter synchronization, outbox-driven workers, retention, and operations.

## Internal architecture anchors

| Existing Nirog source | Workflow implication |
|---|---|
| Modular monolith and schema ownership | A workflow’s authoritative transition is owned by exactly one module; other work begins through a command or committed event. |
| ML pipeline contract | Prescription processing produces evidence and a review state, never a directly active regimen. Stage inputs/outputs require immutable manifests and release lineage. |
| Outbox and consumer ledger | An API command commits business state, audit, and outbox together. Consumers tolerate duplicate delivery and re-read current state. |
| Profile capability, OIDC, RLS | Every profile-scoped workflow begins with current server-side authorization and rechecks current state at sensitive worker boundaries. |
| Data Management approach | Source, action, reference, control, audit, and rebuildable projection records have different lifecycle and recovery behavior. |

## External research translated into workflow rules

| Source | Finding | Nirog workflow design use |
|---|---|---|
| [HL7 FHIR Workflow](https://hl7.org/fhir/workflow.html) | Workflow needs explicit state/relationship data, coordination, allowed actions, dependencies, and conditions. It distinguishes definitions, requests, and events. | Each Nirog workflow names its trigger/request, owner state machine, produced event, parent/source reference, and terminal outcomes. |
| [HL7 FHIR Provenance](https://www.hl7.org/fhir/provenance.html) | A workflow result needs source entities, activities, agents, and versions to be explainable. | Evidence, review, confirmation, release, and asynchronous effect flows preserve provenance links. |
| [NIST SP 1800-1](https://www.nccoe.nist.gov/publication/1800-1/VolE/) | Mobile health workflows need layered access, audit, recovery, retention, and lost-device controls. | Flutter flows include device/revocation checks, minimized sync, server authority, and recovery/reconciliation. |
| [Mobile Apps for Increasing Treatment Adherence: Systematic Review](https://www.jmir.org/2019/6/e12505/) | Medication apps can support home medication management, but workflow needs safety around adherence interpretation and use. | Reminder delivery, dose recording, and adherence summaries remain separate state transitions; a reminder is never proof of a dose. |

## Proposed workflow families

The detailed folder should cover: (1) workflow foundation and contracts; (2) identity/profile/caregiver/consent; (3) catalog curation and release; (4) prescription evidence from upload to review; (5) user-confirmed regimen and medication change; (6) schedule, reminder, dose, inventory, and adherence; (7) Flutter offline synchronization and device lifecycle; (8) async worker/outbox/DLQ/reconciliation; (9) retention/privacy/support operations; and (10) release, migration, incident, and recovery workflows.
