# Prescription Upload and Evidence Ingest Workflow

## 1. Purpose

This workflow safely accepts a prescription image or document from Flutter, records restricted evidence without public exposure, validates the object, and creates a scan request only after the source record is committed. It is designed for unreliable mobile networks, duplicate submits, sensitive content, and later cancellation/retention rules.

## 2. Upload pattern

```mermaid
sequenceDiagram
  autonumber
  participant App as Flutter client
  participant API as Evidence API
  participant DB as PostgreSQL
  participant Store as Private object storage
  participant Scan as Content/malware validator
  participant Outbox as Outbox

  App->>API: Request restricted upload grant with profile/document metadata
  API->>API: Authenticate, resolve profile capability, validate purpose and limits
  API->>DB: Create document draft + upload nonce/idempotency reference
  API->>Store: Create narrow upload grant for object key/policy
  API-->>App: Upload URL/grant, checksum and expiry requirements
  App->>Store: Upload bytes directly with checksum/content type
  App->>API: Complete upload: object reference + checksum
  API->>Store: Verify object metadata/checksum under service identity
  API->>Scan: Validate malware/content type/size as policy requires
  alt object invalid or rejected
    API->>DB: Mark document quarantined/rejected; audit outcome
    API-->>App: Safe rejection/manual entry option
  else object accepted
    API->>DB: Commit asset manifest + document_ready + scan job + outbox
    API->>Outbox: scan.requested committed with reference only
    API-->>App: 202 Accepted with scan resource URL
  end
```

## 3. Synchronous and asynchronous boundaries

| Boundary | Synchronous responsibility | Deferred responsibility |
|---|---|---|
| Grant request | capability/purpose/limits, draft and nonce, narrow upload grant | none. |
| Object completion | checksum/metadata verification, content policy trigger/result, asset manifest, scan request record | scan stage execution. |
| Scan request | document state, idempotency, audit/outbox in one transaction | preprocessing, recognition, extraction, retrieval, policy evaluation. |
| Client response | committed document/scan state and safe status | progress derived from server resource/change feed. |

The broker message contains document/scan IDs, profile scope reference, expected source/version, and correlation data. It never carries image bytes, a public object URL, user access token, or full raw OCR text.

## 4. Ingest states

| State | Meaning | Allowed next action |
|---|---|---|
| `upload_granted` | Draft/nonce and narrow object capability exist. | upload/complete before expiry; cancel. |
| `uploaded_unverified` | Object may exist but is not yet trusted/attached. | verify or cleanup on expiry. |
| `quarantined` | Malware, content, checksum, or policy issue needs containment. | delete/retain for permitted security review; manual entry. |
| `document_ready` | Immutable asset manifest is accepted. | request/continue scan, review lifecycle, retention. |
| `scan_queued` | Scan request committed and event awaiting worker. | cancel; worker claim. |
| `cancelled` | User/system stops future processing. | retention/purge; new request creates new intent. |
| `purge_pending/purged` | Lifecycle controls source. | no new grants/stages. |

## 5. Network duplication and object orphan handling

| Condition | Safe behavior |
|---|---|
| Client retries grant request | idempotency key returns same active draft/grant or safe expired state. |
| Client uploads twice with same nonce | object-store policy/version and completion checksum resolve one accepted manifest. |
| Client loses response after completion | completion idempotency returns existing document/scan state. |
| Object uploaded but completion never called | expiry sweeper finds unreferenced object and deletes/quarantines under policy. |
| Completion references wrong/expired nonce | reject and do not attach object to a document. |
| User cancels while upload in flight | completion verifies current document state; object becomes orphan cleanup/quarantine, not usable evidence. |

## 6. Audit and user experience

The API returns a safe upload/scan status, not internal scanner/provider detail. The user sees whether the document is accepted, needs retry, is rejected with an actionable generic reason, or can continue through manual medication entry. Audit records actor/profile, document reference, policy result, checksum verification category, correlation ID, and safe reason class; raw assets remain private.

## 7. Acceptance tests

Test size/type/checksum limits, expired grant, repeat completion, object orphan cleanup, cancellation race, malware/content rejection, no evidence bytes in event/log, profile authorization, and manual entry availability when evidence ingest cannot proceed.
