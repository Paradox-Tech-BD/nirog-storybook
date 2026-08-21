# Concrete OCR Worker Service Contract

**Status:** deployed and acceptance-verified (Phase 8).

**Depends on:** migration `0010_ocr_worker_boundary.sql`, the Railway dispatcher, Cloudflare R2 evidence foundation, and independently sealed worker-service identities.

> **Operating rule:** the concrete worker is an evidence-only execution peer. It receives an identifier-only dispatcher event, asks Core to lease that exact job, downloads only the Core-authorized object, and submits a bounded result. It never connects to PostgreSQL, receives R2 credentials, selects another object, creates a regimen, or interprets OCR output as a prescription decision.

## 1. Selected service shape

The worker will replace the dormant `workers/ml` loop with a small Python HTTP service deployed as a separate Railway service. It will use a local, container-installed Tesseract engine rather than a managed OCR provider in the first release. This keeps prescription bytes inside the already approved Railway/Core/R2 control plane and avoids introducing a new data processor or API credential. Tesseract supports text output through its command-line interface and can run the LSTM engine with `--oem 1`; English is the initial supported language. [1]

| Component | Responsibility | Explicitly not responsible for |
|---|---|---|
| Railway dispatcher | Claims durable outbox work and POSTs the identifier-only OCR event to the worker. | OCR, clinical reads, evidence downloads, or medication changes. |
| OCR worker | Verifies its dispatcher secret; leases one Core-selected job; obtains one bounded read authorization; converts a supported document into bounded OCR text; submits one controlled result. | PostgreSQL access, R2 credentials, clinical authorization, retry-clock selection, or regimen writes. |
| Core API | Owns profile RLS, lease token hashing, object-read authorization, lifecycle state, retry/dead-letter decisions, extraction storage, audit, and outbox evidence. | OCR engine process execution. |
| Cloudflare R2 | Stores opaque evidence bytes behind a short-lived Core-issued authorization. | Public hosting, worker credentials, or clinical metadata. |

## 2. Delivery and authentication flow

```mermaid
sequenceDiagram
    participant D as Railway dispatcher
    participant W as OCR worker
    participant A as Nirog Core
    participant R as Cloudflare R2

    D->>W: POST event {profileId, evidenceId, ocrJobId}\n+X-Nirog-Dispatcher-Secret
    W->>W: Verify secret + strict identifier schema
    W->>A: POST lease(jobId, profileId)\nX-Nirog-Worker-Secret
    A-->>W: Opaque token + MIME/size + expiry
    W->>A: POST evidence-access(token)
    A->>R: Presign exact object read
    A-->>W: One short-lived download URL
    W->>R: Download to a bounded temporary file
    W->>W: Convert PDF pages if needed; run local Tesseract
    W->>A: POST bounded success or failure result\nIdempotency-Key
    A-->>W: Safe result status
```

Two independently managed secrets are required. `NIROG_INTERNAL_WORKER_SECRET` is shared only between Core API and the worker for Core’s private lease/read/result family. `NIROG_DISPATCHER_TO_WORKER_SECRET` is separately generated and shared only between the dispatcher and worker for event delivery. Both are Railway-sealed values, never source-controlled, logged, placed in event payloads, or returned by any route.

## 3. Input, processing, and bounded output

The worker accepts only `evidence.ocr.requested.v1` events with a UUID-shaped `profileId`, `evidenceId`, and `ocrJobId`. It must deduplicate at the Core lease state rather than trusting an in-memory delivery flag: a second delivery cannot obtain a new active lease. The worker must treat an unavailable lease as a no-op success from the dispatcher’s perspective, because another delivery may have completed it.

| Stage | Constraint | Failure treatment |
|---|---|---|
| Event request | JSON only; maximum body 8 KiB; exact event type/version; constant-time dispatcher secret comparison. | Reject invalid request with `401` or `400`; dispatcher retry is not useful for malformed payloads. |
| Lease | Core job/profile pair only; no client-supplied storage location. | `404`/stale lease is a benign duplicate/no-op. |
| Download | Maximum 10 MiB, HTTPS only, timeout, temporary non-world-readable file, delete in `finally`. | Missing/oversized/invalid object becomes controlled Core failure. |
| Document conversion | JPEG, PNG, and WebP process directly. PDF is rendered with `pdftoppm` at bounded resolution and page count before OCR. | Unsupported/corrupt data is a controlled permanent failure. |
| OCR | Tesseract runs as an unprivileged user with a timeout and `eng` LSTM mode. It outputs plain text only; no provider prompt, confidence, image, or object path enters Core events. | Process timeout/service failure is retryable until the Core attempt cap; then Core dead-letters it. |
| Result | At most 20,000 characters of raw text; no candidate medication mutation. | Worker submits only Core’s allowlisted failure code and cannot choose retry time. |

The initial worker submits `rawText` only. Candidate medication, dose, and frequency extraction remains a later reviewable enhancement; raw text becomes a clinical `pending_review` extraction only through the deployed Core result command. Tesseract’s documented simple invocation produces text output by default, while its `--oem 1` mode selects its LSTM engine. [1]

## 4. Container and runtime requirements

The worker image is based on `python:3.13-slim` and installs only `tesseract-ocr`, `tesseract-ocr-eng`, and `poppler-utils`, plus pinned Python HTTP/validation libraries. It runs as the non-root `nirog` user. The image has no PostgreSQL client, Neon URL, R2 access key, bucket name, or Clerk credential.

| Variable | Holder | Purpose |
|---|---|---|
| `NIROG_CORE_INTERNAL_URL` | Worker | Railway-private Core base URL for the private OCR route family. |
| `NIROG_INTERNAL_WORKER_SECRET` | Core API and worker | Secret-authenticates Core lease/read/result calls. |
| `NIROG_DISPATCHER_TO_WORKER_SECRET` | Dispatcher and worker | Secret-authenticates dispatcher-to-worker event delivery. |
| `OCR_MAX_DOWNLOAD_BYTES` | Worker | Strict local maximum, never greater than Core’s 10 MiB evidence maximum. |
| `OCR_TIMEOUT_SECONDS` | Worker | Bounds each engine invocation. |
| `OCR_MAX_PDF_PAGES` | Worker | Bounds PDF conversion work before OCR. |
| `OCR_LANGUAGE` | Worker | Initial default `eng`; adding another language requires a reviewed container package and contract update. |

## 5. Deployment and observability

The dispatcher receives a handler for `evidence.ocr.requested.v1` and delivers only `{ profileId, evidenceId, ocrJobId }` to the private worker URL. The worker exposes `/health/live` and one internal event endpoint. It logs correlation ID, job ID, evidence ID, transition outcome, duration, and controlled failure code only. It must never log a secret, lease token, signed URL, R2 key, raw text, candidate, page image, or document bytes.

Core remains the source of durable retry/dead-letter behavior. A temporary network/engine fault becomes `retryable_failure`; Core calculates the next attempt and caps attempts. An invalid object or unsupported document is a `permanent_failure`. Neither outcome authorizes a clinical change.

## 6. Verification gate

The worker increment is complete only when its package tests cover secret rejection, schema validation, duplicate delivery/no-op behavior, bounded download, OCR timeout mapping, PDF/image processing selection, result redaction, and temporary-file cleanup. Core/dispatcher tests must prove identifier-only event delivery. A disposable integration test must prove no worker route can read outside a leased job/profile. Railway deployment must configure a separate worker service and its two sealed secrets, then verify the worker health route and a controlled non-clinical test event without real patient evidence.

## 7. Deployment acceptance record

The isolated Railway worker, dispatcher, and Core API are deployed and online. The worker has no PostgreSQL, R2, or Clerk configuration; the dispatcher and worker continue to authenticate through their independent sealed ingress identity, while Core-to-worker calls use the separately sealed internal identity. The production R2 bucket allows only the required browser origins and `PUT`, `GET`, and `HEAD` methods for controlled presigned evidence operations; it is not publicly exposed.

The acceptance smoke test used a protected, Clerk-session-bound web-companion route limited to the isolated competition profile and a fixed prescription. It created only a synthetic, monochrome PNG containing **“NIROG OCR TEST”**, **“SYNTHETIC DOCUMENT”**, **“CODE 20260821”**, and **“NO CLINICAL DATA.”** The route authorized and uploaded evidence through the normal Core workflow, completed the evidence record, enqueued the identifier-only outbox event, and polled Core’s review projection.

The dispatcher delivered the event, the worker acquired the Core lease, and Core persisted one `pending_review` extraction with the bounded synthetic text. No medication, regimen, dose log, candidate medication field, or prescription state was created or changed automatically. During acceptance, an API lease predicate was corrected to use PostgreSQL `now()` rather than binding a raw JavaScript `Date` inside a SQL fragment; the Core regression test protects this driver-serialization boundary. Core lint, TypeScript, and the full unit suite passed with **46 passing tests** and **9 environment-dependent skips**. The repository-wide formatting gate continues to report pre-existing unrelated formatting drift and was not rewritten as part of this deployment repair.

## References

[1] [Tesseract command-line usage](https://tesseract-ocr.github.io/tessdoc/Command-Line-Usage.html)
