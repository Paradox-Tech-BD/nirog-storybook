# Research Sources

This source register records external references used to challenge the whitepaper’s assumptions and create the implementation baseline. It is a technical design reference, not legal or clinical advice.

| Ref. | Source | Design consequence |
|---|---|---|
| [1] | [World Health Organization, *Ethics and governance of artificial intelligence for health*](https://www.who.int/publications/i/item/9789240029200) | Treat human rights, human oversight, transparency, and accountability as product requirements. |
| [2] | [NIST, *AI Risk Management Framework*](https://www.nist.gov/itl/ai-risk-management-framework) | Operate AI lifecycle controls across Govern, Map, Measure, and Manage functions. |
| [3] | [IMDRF, *Good machine learning practice for medical device development: Guiding principles*](https://www.imdrf.org/documents/good-machine-learning-practice-medical-device-development-guiding-principles) | Use disciplined datasets, validation, human factors, release governance, and monitoring as a quality benchmark. |
| [4] | [HL7 FHIR, *MedicationRequest*](https://hl7.org/fhir/medicationrequest.html) | Keep prescription/order and dosage instructions distinct from product catalog and dose events. |
| [5] | [HL7 FHIR, *MedicationAdministration*](https://hl7.org/fhir/medicationadministration.html) | Model actual/self-reported dose events separately from orders and schedules. |
| [6] | [HL7 FHIR, *MedicationStatement*](https://hl7.org/fhir/medicationstatement.html) | Distinguish a reported ongoing medication state from a specific administered dose. |
| [7] | [HL7 FHIR, *Provenance*](https://hl7.org/fhir/provenance.html) | Preserve model, source, agent, and transformation context for generated results. |
| [8] | [HL7 FHIR, *AuditEvent*](https://hl7.org/fhir/auditevent.html) | Keep access and security events append-only and separate from provenance. |
| [9] | [OWASP, *API1:2023 Broken Object Level Authorization*](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) | Require policy evaluation for every protected object action. |
| [10] | [DeepSeek-AI, *DeepSeek-VL2 official repository*](https://github.com/deepseek-ai/DeepSeek-VL2) | Do not assume general VLM output includes calibrated per-line OCR confidence; implement a versioned adapter and independent calibration. |
| [11] | [Rahman & Khan, *Medicinal Products in Bangladesh*](https://data.mendeley.com/datasets/zhtvkny53n/1) | Use source/license/version/provenance fields for catalog imports and validate freshness/clinical accuracy before production use. |
| [12] | [Nirog Whitepaper, Version 1.0](Nirog_Whitepaper.pdf) | Original product hypothesis, proposed architecture, and requirements under assessment. |

The accompanying `research-notes.md` preserves the applied findings generated during the assessment. The full whitepaper PDF is retained in this directory to make the assessment reproducible.
