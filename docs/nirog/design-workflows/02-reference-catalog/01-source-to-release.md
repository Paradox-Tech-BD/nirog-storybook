# Catalog Source-to-Release Workflow

## 1. Purpose

The Medicine Catalog is a shared, curated reference product. It accepts accountable source material, validates and normalizes candidate records, routes semantic changes through curation, publishes immutable releases, builds release-bound indexes, and retains the artifacts needed to explain or roll back a historic matching result. It is not populated directly from prescription OCR or profile-private user corrections.

## 2. Source import through publication

```mermaid
sequenceDiagram
  autonumber
  participant Curator as Curator/import operator
  participant API as Catalog API
  participant Source as Approved source artifact
  participant DB as catalog schema
  participant Worker as Import/index worker
  participant Index as Search/match index
  participant Audit as Audit/outbox

  Curator->>API: Register source import with provenance and version
  API->>DB: Create source receipt + checksum + import request
  API->>Audit: Commit catalog.import_requested outbox event
  API-->>Curator: Accepted import operation
  Audit->>Worker: Deliver committed import request
  Worker->>Source: Fetch/parse approved source under adapter policy
  Worker->>DB: Validate structure, provenance, license, duplicate keys
  alt validation fails
    Worker->>DB: Record rejected source findings
    Worker->>Audit: Emit catalog.import_failed
  else validation succeeds
    Worker->>DB: Create curation case and candidate diff
    Curator->>API: Review evidence and approve/reject proposed change
    API->>DB: Create immutable draft release manifest
    API->>Audit: Commit catalog.index_requested
    Audit->>Worker: Deliver index build request
    Worker->>Index: Build index from release manifest/config
    Worker->>DB: Record index manifest and validation result
    Curator->>API: Publish validated release
    API->>DB: Mark successor active; retire prior release by policy
    API->>Audit: Commit catalog.release_published
  end
```

## 3. State model

| State | Owner | Entry condition | Exit condition |
|---|---|---|---|
| `source_received` | Catalog | receipt/provenance/checksum recorded | structural validation begins. |
| `source_rejected` | Catalog | invalid source, unknown provenance, unsupported license/schema | corrected/new source request. |
| `curation_open` | Curator | valid candidate diff/finding exists | approval, rejection, or revision. |
| `release_drafted` | Catalog | approved change set has immutable manifest | index build request. |
| `index_building` | Worker | committed index request claimed | validation pass/fail. |
| `release_ready` | Catalog | index manifest and quality checks pass | governed publish. |
| `published` | Catalog | active release pointer moves | successor retirement/rollback. |
| `retired` | Catalog | successor or controlled rollback activated | retain for historic explanation. |

## 4. Required validation and curation gates

| Gate | Required evidence | Failure behavior |
|---|---|---|
| Source provenance | origin, version/date, license/use record, receipt checksum | reject import; do not create anonymous product facts. |
| Structural validity | required fields, types, external IDs, source schema | record findings; no draft release. |
| Semantic validity | ingredient/strength/form/route consistency and normalized values | curation case; no silent coercion of critical fields. |
| Diff impact | additions, removals, aliases, changed identifiers, active-match impact | require review level appropriate to impact. |
| Index integrity | release checksum, index config/model version, sampled known query checks | keep prior active index/release. |
| Publication authority | curator role, review evidence, release state | deny publication; audit attempt. |

## 5. Immutable release behavior

Published release contents do not mutate. If a reference correction is needed, Catalog creates a successor release and documents the predecessor relationship. A matching result stores the release/index/matching-policy IDs it used, so later publication cannot silently alter the explanation of an earlier review.

The active release pointer may change, but historic review payloads retain their original context. A known-bad release may be retired and prior validated release restored as the active pointer; it is not rewritten in place.

## 6. Worker failure and recovery

| Failure | Safe behavior |
|---|---|
| Source fetch timeout | bounded retry only when source adapter policy allows; preserve request/correlation. |
| Source checksum changes during import | fail/supersede import; require new receipt rather than mixing inputs. |
| Import worker duplicate delivery | consumer ledger/idempotent source receipt prevents duplicate curation/release. |
| Index build crash | draft remains non-active; retry from immutable release manifest. |
| Index build result is stale | validate active draft/release version before recording/activation. |
| Publish API replay | idempotent release state response; one active pointer transition/audit event. |

## 7. Acceptance tests

Test invalid provenance, duplicate source delivery, changed checksum, curation rejection, concurrent publish, index validation failure, rollback to prior release, and an older review retaining its original matching context after a successor release. Prove that profile/private OCR feedback cannot write catalog tables without a curation workflow.
