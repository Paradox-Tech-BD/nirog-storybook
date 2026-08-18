# Prescription Stage Processing and Review Workflow

## 1. Purpose

After a committed scan request, specialized workers run a controlled evidence pipeline: preprocess, recognize, organize, extract, retrieve/rerank, and evaluate review policy. Each stage writes only Evidence-owned state and immutable execution lineage. The terminal product is a review payload or safe manual path—not an active regimen.

## 2. Stage sequence and safety gate

```mermaid
sequenceDiagram
  autonumber
  participant Relay as Outbox relay
  participant Worker as Evidence worker
  participant DB as prescription schema
  participant Store as Private object storage
  participant Catalog as Release-bound catalog/index
  participant Policy as Review policy
  participant App as Flutter client

  Relay->>Worker: scan.requested event reference
  Worker->>DB: Claim consumer ledger; re-read scan/document state
  Worker->>DB: Check cancellation, retention, current authorization/purpose
  Worker->>Store: Fetch restricted asset through service scope
  Worker->>DB: Persist preprocess stage manifest and result reference
  Worker->>DB: Persist recognition raw-output reference and text/region evidence
  Worker->>DB: Persist structured field candidates + validation findings
  Worker->>Catalog: Request candidates with catalog/index/policy releases
  Catalog-->>Worker: Compatible candidate context
  Worker->>Policy: Evaluate quality, reliability, validation, candidate margin
  alt safe reviewable evidence
    Worker->>DB: Persist versioned review payload: ready_for_review/review_required
  else unreliable/blocked evidence
    Worker->>DB: Persist manual_entry_recommended or failed-safe outcome
  end
  Worker->>DB: Commit stage outcome + audit/provenance + outbox change event
  App->>DB: Retrieves authorized scan/review status via API/sync
```

## 3. Stage contract

| Stage | Input | Output | Hard stop rule |
|---|---|---|---|
| Preprocess | immutable asset + preprocessor release | derived asset + transform manifest/fingerprint | never overwrite original evidence. |
| Recognition | derived asset + model/prompt config | text/regions + restricted raw result reference | provider/model output is observation, not medication fact. |
| Organization | text/regions + abbreviation release | line/section relationships | retain raw span/region references. |
| Structured extraction | source evidence + schema release | field candidates, normalized values, validation findings | reject malformed critical output; do not silently repair. |
| Retrieval/reranking | parsed signals + catalog/index release | compatible candidates/features | filter strength/form/route/ingredient, not text similarity alone. |
| Policy evaluation | all evidence/signal/release context | review state and reason classes | never returns active regimen. |

## 4. Review payload

The review payload is a versioned, user-facing evidence object. It includes source crop/line references where permitted, parsed fields, validation findings, ranked compatible candidates, release/policy context, expiry, and the result of confidence/quality policy. It is not a hidden model blob and it is not a mutable direct edit of the regimen.

| Review outcome | Client behavior | Next allowed action |
|---|---|---|
| `ready_for_review` | show evidence/candidates and confirmation controls | user edit/select/confirm into separate regimen command. |
| `review_required` | require critical field correction or selection | user edit/manual entry; no activation. |
| `manual_entry_recommended` | make manual medication entry primary | retain evidence only per lifecycle policy. |
| `blocked` | explain generic safe condition | retry only after policy/dependency condition changes. |
| `failed` | show safe retry/manual option | new request or governed retry; no partial silent result. |

## 5. Worker rechecks and result commit

Before asset access and before each terminal output commit, the worker validates that the scan job/document is still active, not purged/cancelled, and still targets the expected stage/input fingerprint. It validates its current service role and applicable purpose policy. A later cancellation, purge, source update, or newer stage lineage turns the worker result into `cancelled` or `superseded` rather than allowing a stale review payload to surface.

## 6. Model/provider failure rules

| Failure class | Worker response |
|---|---|
| Temporary network/rate/provider fault | persist retry class/next time under bounded budget; do not duplicate external effect without provider intent/reconciliation. |
| Provider response unknown after request | persist deterministic provider intent; reconcile before resend. |
| Invalid/oversized/malformed result | terminal safe failure/manual entry; preserve redacted diagnostic/reference. |
| Schema/model/prompt/release mismatch | block/supersede stage; require compatible new lineage. |
| Low quality/ambiguous evidence | complete safely as review/manual path, not “error retry until confident.” |
| Cancellation/revocation/purge | no-op/cancel before restricted output or user-visible result. |

## 7. Acceptance tests

Test duplicate event claim, model config change mid-run, asset cancellation/purge race, malformed output, route/strength mismatch, ambiguous candidate margin, provider uncertainty, review payload expiry, and proof that worker database credentials cannot write regimen/adherence tables.

