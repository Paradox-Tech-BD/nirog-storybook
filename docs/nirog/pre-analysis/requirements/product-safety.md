# Product Safety Boundary

**Status:** Canonical baseline • **Scope:** MVP • **Owner:** Product + clinical curator • **Review cadence:** Before every model, threshold, or reminder-policy release.

## Intent

Nirog is a medication-management aid. It helps a person capture a handwritten prescription, review a machine-assisted interpretation, create a personal medication schedule, record app-based dose events, and manage reminders. It is not a diagnostic, prescribing, dispensing, dose-calculation, substitution, interaction-checking, or clinical-advice system.

> **Safety invariant:** A scan is source evidence, not a regimen. A regimen must never become active until the patient or authorized profile owner has reviewed and saved the medication-critical instructions.

## What the MVP may do

| Capability | Permitted behavior | Required safeguard |
|---|---|---|
| Prescription capture | Store page images and run OCR/extraction. | Ask the user to select the target profile; do not infer identity from handwritten patient text. |
| Medicine matching | Retrieve and preselect likely catalog products. | Display the original evidence and alternatives; state that a suggestion is not clinical verification. |
| Regimen creation | Create a personal schedule from accepted instructions. | Require a valid product or unresolved manual entry plus confirmed quantity, unit, frequency/timing, route where supplied, and start rule. |
| Reminders | Produce best-effort, local device schedules. | Do not claim delivery or ingestion; surface notification-permission and scheduling-health problems. |
| Adherence view | Summarize app-recorded and self-reported dose events. | Label the metric as app-recorded/self-reported; preserve inferred versus user-reported statuses. |
| Catalog curation | Maintain approved brand/generic/product facts. | Publish shared changes only through auditable curation and rollback controls. |

## What the MVP must not do

The MVP must not say that a medicine is safe, suitable, interchangeable, or correct for the user; interpret a diagnosis; recommend treatment; calculate a clinical dose; advise on interactions, pregnancy, contraindications, adverse effects, or stopping treatment; infer that a dose was consumed because a reminder was scheduled; or turn a low-confidence/partial extraction into an active schedule.

Future clinical content requires a separately approved knowledge source, clinical governance owner, harm analysis, user language review, and release gate. Consumer positioning does not remove the need for evidence preservation, human review, security, privacy, monitoring, and clearly bounded claims. WHO’s AI-for-health guidance and the NIST AI RMF are the governing reference frameworks for these lifecycle controls.[1] [2]

## Regimen activation gate

The transactional backend must reject schedule activation when any mandatory rule fails. The gate accepts a **reviewed** prescription line or a manual item and then validates the following conditions.

| Gate | Rule | Result on failure |
|---|---|---|
| Source association | The line belongs to the selected profile or is explicit manual entry. | Require profile selection or manual-entry path. |
| Identity resolution | A catalog product is accepted, or the item is saved as profile-private unresolved medication. | Never create a shared product implicitly. |
| Critical field completeness | Quantity, unit, timing/frequency, and start semantics are present and valid. | Save as review draft; do not schedule. |
| Ambiguity policy | No unresolved ambiguity in dose, unit, timing, route, duration, or product form remains. | Require user edit/confirmation. |
| Schedule representability | The instruction maps to a supported timing rule. | Preserve free text and prompt for a manual reminder plan. |
| Consent and authority | Actor has permission to operate on the selected profile. | Return an authorization denial and audit the attempt. |
| Version integrity | Review applies to the exact extraction, catalog release, and policy version displayed. | Require refreshed review when material evidence changed. |

## Safety language in the client

Use: **“We found a possible match. Please compare it with your prescription before saving.”** Do not use: “Verified,” “safe,” “correct,” “recommended,” or “your prescribed dose” when the value is still generated or unreviewed. A user can mark an item as reviewed; that is not a clinical validation claim.

## Incident and change controls

If a critical extraction, matching, schedule, or reminder defect is discovered, the system must support an immediate policy kill switch, catalog/alias rollback, model/prompt/index rollback, notification pause for affected versions, user-impact query, and append-only incident record. Shared model and catalog changes are controlled releases, not editable live configuration.

## References

[1] [World Health Organization, *Ethics and governance of artificial intelligence for health*](https://www.who.int/publications/i/item/9789240029200)

[2] [NIST, *AI Risk Management Framework*](https://www.nist.gov/itl/ai-risk-management-framework)
