# Research Notes: Nirog Backend Requirements

## Interoperability and audit model

- HL7 FHIR treats a medication request/order as distinct from dispensing, a patient-reported medication statement, and the actual event of consuming/administering a dose. Nirog should maintain distinct records for the scanned prescription line, the patient’s accepted active regimen, and each scheduled/actual dose event rather than overload a single `Medicine` table.
- A prescription is a multi-item source document. Each medication line should carry an order-line identifier and link to a `prescription_document` / `prescription` aggregate. This supports replacement, discontinuation, partial acceptance, and later reconciliation.
- Medication-taking status is not evidence that a dose was actually ingested; self-reported dose logging should record reporter, entry method, planned dose time, recorded time, status, and reason. The user-facing adherence statistic must be labelled as self-reported / app-recorded adherence.
- Provenance is a record of how a resource was produced. Nirog needs immutable snapshots for raw OCR/model output, preprocessing version, prompt/template version, model/artifact version, candidate list, scoring configuration, user edits, and origin actor.
- Audit events record operational, privacy, and security-relevant actions. They must be append-only and restricted from ordinary user access. Prescription image reads/downloads, data exports, clinician/caregiver access, admin curation, consent changes, account deletion, and sensitive configuration changes need audit records.

## Initial source set

- HL7 FHIR MedicationRequest, R5: https://hl7.org/fhir/medicationrequest.html
- HL7 FHIR MedicationAdministration, R5: https://hl7.org/fhir/medicationadministration.html
- HL7 FHIR MedicationStatement, R5: https://hl7.org/fhir/medicationstatement.html
- HL7 FHIR Provenance, R5: https://hl7.org/fhir/provenance.html
- HL7 FHIR AuditEvent, R5: https://hl7.org/fhir/auditevent.html

## Implication

FHIR alignment is not required for the MVP, but an internal model inspired by these distinctions will prevent later breaking migrations and make a future FHIR adapter feasible.

## Health-AI governance and confidence controls

WHO’s guidance on AI for health emphasizes ethics, human rights, accountability, and responsiveness to affected communities. NIST’s AI RMF provides the operating cycle **Govern, Map, Measure, and Manage**, and its Generative AI Profile specifically addresses GenAI risk. IMDRF’s Good Machine Learning Practice principles provide a relevant quality benchmark even if Nirog is deliberately positioned as consumer medication-management software rather than a regulated diagnostic or prescribing product.

The backend must therefore treat the OCR and matching system as a **versioned decision-support pipeline**, not a stateless inference call. Required governance artifacts are a model registry; prompt/template registry; data-set and evaluation-set registry; evaluation report versions segmented by handwriting style, language mix, capture quality, and medical specialty where feasible; release approvals; kill switch and rollback; threshold configuration history; and post-release quality monitoring. Confidence must be empirically calibrated on held-out, representative prescriptions. A model-provided confidence value is only an input signal; it must not by itself trigger auto-creation of a medication regimen.

For clinical safety, the product should distinguish **recognition confidence**, **field completeness/validation**, **medicine-identity confidence**, and **regimen-safety eligibility**. Auto-acceptance must be forbidden if dose, unit, route, frequency, or duration is missing or ambiguous, even when the brand match is strong. The UI must communicate that the suggestion is extracted from an image and requires the user to check against the original prescription; it must never state or imply that the app has clinically verified the prescription.

## API security and sensitive-record access

OWASP states that every endpoint acting on a client-provided record identifier needs a server-side object-level authorization decision. Nirog therefore requires central policy enforcement for each scan, image, prescription, medication, regimen, dose event, profile, consent, caregiver grant, and admin-curation record. A simple `user_id` equality comparison is inadequate for a household/caregiver model. The policy needs explicit subject, profile/patient, relationship, role, action, and contextual-consent checks.

Use opaque UUID/ULID identifiers, query scope derived from the authenticated principal rather than a supplied `userId`, signed short-lived URLs for prescription images, server-side MIME/size/pixel validation, malware scanning, EXIF stripping, image-bomb limits, and separate service credentials for the ML worker. Build automated authorization-negative tests for all object routes. Retain append-only audit events for access, share, export, deletion, image viewing, ML inference, user correction, and administrator curation without writing raw prescription text, tokens, or image URLs into general application logs.

## Additional sources

- World Health Organization, *Ethics and governance of artificial intelligence for health*: https://www.who.int/publications/i/item/9789240029200
- NIST, *AI Risk Management Framework*: https://www.nist.gov/itl/ai-risk-management-framework
- IMDRF, *Good machine learning practice for medical device development: Guiding principles* (2025): https://www.imdrf.org/documents/good-machine-learning-practice-medical-device-development-guiding-principles
- OWASP, *API1:2023 Broken Object Level Authorization*: https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/

## Model-capability validation

The official DeepSeek-VL2 repository demonstrates multimodal generation and region/bounding-box output, but the published examples do not establish a native per-line calibrated OCR-confidence API or a medically validated handwriting-recognition workflow. The whitepaper’s use of “per-line confidence” and “model self-reported confidence” must therefore be treated as **proposed application-level signals**, not an intrinsic, validated model capability.

Nirog needs a model-adapter contract that normalizes outputs from the selected VLM, OCR fallback, and reranker. The adapter must preserve the exact request template, decoding parameters, model revision/checksum, tokenizer/processor revision, image-transform configuration, raw generated content, parsing result, and any provider-reported usage/latency. It must separate a parseable structured result from the raw output and reject responses that do not conform to a strict server-owned schema. JSON repair must be recorded and never silently change medication-critical content.

A reliable extraction score needs a separately evaluated calibration layer trained or fitted against labeled data. It should combine observable signals such as schema validity, agreement across two independent recognizers, image-quality score, OCR token log-probabilities where genuinely available, candidate-score margin, and historical error rate in the same input-quality/language segment. The clinical safety policy must use this calibrated risk score plus hard field-completeness rules, not LLM self-assessment.

For maintainability, a model selection policy must be versioned per stage: `primary_vision_model`, `fallback_vision_model`, `structured_extractor`, `embedding_model`, and `reranker`. A fallback cannot merely be “TrOCR for low confidence regions” unless its regional crop/line-detection source, language coverage, acceptance criteria, and reconciliation rules are defined.

## Model source

- DeepSeek-AI, *DeepSeek-VL2 official repository*: https://github.com/deepseek-ai/DeepSeek-VL2

## Medicine knowledge-base provenance

The Kaggle result used in the whitepaper is described as an assorted Bangladesh medicine dataset and appears to attribute its data to MedEx, but the review did not provide a complete, independently auditable record of data provenance, extraction date, individual source terms, update cadence, or whether downstream commercial/service redistribution is authorized. A Kaggle upload’s selected license is not by itself sufficient evidence that the original upstream content can be reused in a production service. It can be used for prototyping and offline evaluation only until provenance and permissions are verified.

A more traceable alternative is the Mendeley Data publication **Medicinal Products in Bangladesh – A Dataset of Generic and Brand Names, Dosage Strengths, and Manufacturers**, version 1, published 18 September 2024, DOI `10.17632/zhtvkny53n.1`, under CC BY 4.0. It should still be subject to profiling and clinical/pharmacist verification before user-facing use because a research dataset is not a regulatory product catalogue and is already date-stamped.

The data model should make provenance first-class: every imported record needs `source_dataset_id`, source-row locator, license, source publication/URL, source version, import batch, observed/effective date, checksum, curator, verification status, and supersession linkage. Product facts should have `valid_from`, `valid_to`, and `review_due_at`; an inactive/discontinued product must remain historically resolvable for old prescriptions but not be newly suggested. Match index rebuilds need to be tied to a specific catalog and embedding snapshot.

## Data sources

- Kaggle, *Assorted Medicine Dataset of Bangladesh*: https://www.kaggle.com/datasets/ahmedshahriarsakib/assorted-medicine-dataset-of-bangladesh
- Rahman & Khan, *Medicinal Products in Bangladesh – A Dataset of Generic and Brand Names, Dosage Strengths, and Manufacturers*, Mendeley Data (2024), CC BY 4.0: https://data.mendeley.com/datasets/zhtvkny53n/1

