# ML Pipeline Contract

**Status:** Proposed baseline • **Owner:** ML + backend • **Non-negotiable:** Evidence must outlive the model run.

## Stages

| Stage | Input | Output | Hard rule |
|---|---|---|---|
| Ingest | Validated document pages. | Asset manifest, quality findings, job id. | Do not expose public object URLs or pass account identity to the worker. |
| Preprocess | Immutable asset plus preprocessing configuration. | Derived asset, transform manifest, input fingerprint. | Preserve the original image; never overwrite evidence. |
| Recognition | Derived asset and vision-model request manifest. | Verbatim text lines, regions/crops where available, raw provider output. | Confidence is a signal, not a decision. |
| Organization | Text/regions, abbreviation-table release. | Clinical-section and line association candidates. | Preserve source line/region references. |
| Structured extraction | Source evidence and schema version. | Field candidates with raw spans, normalized values, validation findings. | Reject nonconforming model output rather than silently repairing critical values. |
| Retrieval and reranking | Extracted name plus parsed strength/form/route evidence, catalog/index release. | Ranked compatible product candidates and feature scores. | Filter/rerank by form, strength, ingredient, and route compatibility, not string similarity alone. |
| Policy evaluation | Evidence, calibrated quality/risk signals, review policy. | `ready_for_review`, `blocked`, or `needs_manual_entry`. | The policy never returns `active_regimen`. |

## Execution manifest

Each stage run persists an immutable manifest containing `scan_job_id`, stage, attempt number, input fingerprint, input asset/parent-result references, started/completed timestamps, execution status, model/provider identifier, model revision/checksum, prompt/template version, decoding parameters, processor/tokenizer version, preprocessor version, abbreviation release, catalog release, retrieval-index release, matching-policy release, raw output reference, parsed output reference, and redacted usage/cost telemetry.

The stage input fingerprint must include all material execution inputs. `scanId + stage` is not enough: a retry after an updated crop algorithm, prompt, model, or catalog release must be a new lineage, while a repeated mobile submission needs a separate request idempotency key.

## Confidence and decision policy

The service must store distinct signals for image quality, recognition reliability, field validation, product-match likelihood, candidate margin, and schedule eligibility. Model self-assessment is never sufficient. A calibrated policy artifact, fitted on a held-out and representative labeled set, maps observable signals into UX treatment. The policy version and its evaluated metrics must be queryable for every result.

| Outcome | Meaning | Client behavior |
|---|---|---|
| `ready_for_review` | A result can be shown with a candidate/preselection. | Present original crop, parsed fields, alternatives, and confirmation controls. |
| `review_required` | Critical fields are partial, ambiguous, or low-confidence. | Require edit or manual entry; no schedule activation. |
| `manual_entry_recommended` | Recognition/matching is not reliable enough. | Offer manual medication entry while retaining document evidence if permitted. |
| `failed` | Infrastructure/model/input failure. | Explain retry condition without exposing internal details. |

## Evaluation release gate

Assess character/word error only as diagnostic metrics. The release gate must additionally measure exact match for critical fields, false high-confidence suggestion rate, calibration/coverage, abstention rate, post-review correction by field, and performance segments for Bangla, English, mixed script, photo quality, device class, layout, and relevant prescription specialties. Any change to model, prompt, image preprocessing, abbreviation table, embedding model, index, catalog, reranker, or confidence policy requires an impact evaluation.

## Active-learning safety

Feedback is evidence about a user selection, not a verified clinical truth. Profile-private corrections can improve that profile’s experience. A shared alias/product change requires a curation case, source evidence, reviewer decision, catalog release, index rebuild, and rollback path. No anonymous nightly vote threshold alone is sufficient to publish shared health-reference data.
