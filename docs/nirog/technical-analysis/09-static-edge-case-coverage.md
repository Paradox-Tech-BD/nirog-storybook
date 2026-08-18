# Static Architecture and Security Coverage Extensions

## 1. Scope and interpretation

This is a **static review of the current backend architecture documentation**, not an executable source-code scan. The reviewed material already establishes important controls: transactional outbox publication, idempotent consumers, retry classification, DLQ recovery, profile-scoped authorization, PostgreSQL RLS defense, restricted evidence handling, and release/version lineage.

The purpose of this document is constructive. It defines additional edge-case coverage that should become explicit implementation requirements, migration constraints, automated tests, and operational runbooks before the related code is widened in production. The items below are not assertions of current defects; they are safeguards for race conditions, partial failures, retries, external uncertainty, and control-plane changes that occur in distributed systems.[1] [2]

## 2. Cross-cutting rule: the authoritative state wins

An event envelope, queue payload, browser request, object-storage capability, cached authorization decision, and external provider response are all **inputs**. PostgreSQL aggregate/state records, approved release manifests, current authorization/consent state, and immutable evidence lineage remain authoritative. A worker must re-check that authoritative state before an irreversible effect. This rule resolves most edge cases consistently: stale work becomes a no-op or superseded result, rather than a retry or an overwrite.

## 3. Async delivery and worker recovery coverage

| Edge case to cover | Required implementation control | Required automated proof |
|---|---|---|
| A relay lease expires while the first relay is slow but still alive | Store a lease token/fencing value with the claim. Only the current claim token may record publication status; expired claims may be reclaimed. | Two relays race after a lease expiry; only the valid claimant changes relay state, and duplicate broker publish remains harmless. |
| Broker accepts publish but publisher confirmation is lost | Keep event ID stable and allow retrying publication. Consumers dedupe by `(consumer_name, event_id)`. | Simulate acknowledgement loss after publish; owned consumer effect appears once. |
| Event sequence has a gap or arrives out of order for one aggregate | Persist aggregate version in envelope and consumer state. Delay/reload when an earlier required version is absent; do not apply a newer projection that invalidates ordering semantics. | Deliver version `n+1` before `n`; consumer waits/reconciles and eventually applies correct order. |
| A worker process pauses after lease claim and resumes after another worker completes | Consumer-ledger completion and output reference are authoritative. A resumed worker must re-read ledger/aggregate state before a provider call. | Pause then resume a worker after a duplicate completes; no second provider intent/effect is created. |
| A retry message is delivered after task/job age has expired | Persist `expires_at`/maximum execution age in task state. Worker marks expired rather than executing. | Redeliver a retry past the task window; terminal outcome is safe and observable. |
| A malformed or oversized event exhausts consumers repeatedly | Validate envelope schema, version, size, and allowed routing before business handling. Quarantine deterministic envelope faults without retry. | Feed invalid JSON, unknown version, over-limit payload, and unrecognized event type; each reaches redacted terminal/DLQ path once. |
| A poison message blocks a FIFO partition or monopolizes a worker | Use bounded attempt budget, per-message isolation, and partition/queue alerting. A terminal event must release later independent work. | Send a permanently invalid task followed by valid work; the valid work proceeds within its target age. |
| Retry storm begins during provider outage | Apply exponential backoff with jitter, provider circuit breaker, per-queue concurrency ceiling, and admission/backpressure policy. | Simulate sustained provider `5xx`; attempt rate remains bounded and core API/regimen tasks remain available. |
| Worker configuration changes while a delayed job waits | Job references required release/config versions. Worker accepts only a supported compatibility range; otherwise supersedes or creates a governed new attempt. | Process delayed work after a breaking parser/policy release; old work is not silently interpreted by incompatible code. |

### 3.1 Provider intent and uncertain outcomes

The most important external-side-effect edge case is an ambiguous response: the worker sends a request, the provider may accept it, and the connection breaks before the worker receives a response. The durable workflow must create a provider-intent record before the request, use a deterministic provider idempotency key, record `outcome_unknown` if needed, and schedule reconciliation by that key. A blind retry is prohibited until reconciliation establishes that the provider did not accept the original request.

| Provider interaction | Durable state before call | Safe post-failure state | Reconciliation action |
|---|---|---|---|
| Push notification dispatch | delivery ID and deterministic delivery key | `outcome_unknown`, not `failed` | query provider if supported; otherwise expire/notify by policy rather than duplicate a late reminder |
| External ML inference | stage run ID, input fingerprint, release manifest, request key | `outcome_unknown` with restricted raw-result reference pending | query/retrieve result by provider job/request ID; create a new attempt only under stage policy |
| Object-store copy/transformation | source checksum, destination key/intent | destination validation pending | verify destination checksum and object metadata before retry/copy cleanup |
| Catalog source fetch | source version/checksum expectation | snapshot incomplete | retry fetch with bounded policy; do not publish partial source/release |

## 4. Database and transaction coverage

| Edge case to cover | Required implementation control | Required automated proof |
|---|---|---|
| Command commits aggregate but audit/outbox insert fails | Audit, idempotency outcome, state change, and outbox row share one transaction. Failure rolls back the command. | Force each write failure in turn; no partial aggregate result is visible. |
| API repeats a key after idempotency record TTL cleanup | Retention policy for idempotency rows must exceed the client retry/offline replay window, or retained tombstone/hash semantics must detect a conflicting reuse. | Replay a stale client mutation after cleanup boundary; result cannot double-apply an effect. |
| Same idempotency key arrives from another account | Key uniqueness is actor-scoped and request hash is validated. Never use a globally reusable client key as authority. | Two actors submit the same key; neither sees/receives the other’s response. |
| Connection pooling leaks RLS context from a previous request | Set account/profile context with transaction-local `set_config(..., true)` after policy evaluation; reset on checkout/return and prohibit session-level context. | Reuse pooled connection across two profiles; second request receives no rows from first profile. |
| Database failover or clock change affects leases/backoff timestamps | Use database time for lease/next-attempt comparisons where possible, preserve a fencing token, and avoid relying on worker-local clock for authority. | Simulate clock skew/failover; stale claimant cannot complete an effect. |
| Long backfill competes with user transactions | Make backfill idempotent, chunked, rate-limited, resumable, and separately observable; use compatible indexes/DDL. | Interrupt/resume backfill under interactive write load; no prolonged lock or duplicate derived result occurs. |
| Aggregate version update races a worker projection | Lock or compare aggregate version and recompute desired projection from current state. | Regimen changes while a projection runs; final future planned-dose state matches the newest version. |

PostgreSQL RLS requires special deployment attention because table owners and roles with `BYPASSRLS` can bypass row-security policy.[3] Application, migration, administrative, and worker roles must therefore remain distinct; a migration must not temporarily elevate the normal API role merely to simplify deployment.

## 5. Authorization, consent, and session coverage

| Edge case to cover | Required implementation control | Required automated proof |
|---|---|---|
| Caregiver access is revoked between job enqueue and worker execution | Job references profile/resource only. A worker re-checks current authorization/consent at every sensitive access boundary and cancels/supersedes when revoked. | Revoke a grant after enqueue but before asset/read action; worker reads nothing further and emits no downstream user-visible result. |
| Consent changes after a capability URL is issued | Capabilities are short-lived, purpose-bound, and revalidated by object/document state at use or completion where feasible. | Withdraw consent after grant creation; subsequent use/completion is denied or safely quarantined. |
| OIDC key rotation occurs during a validation cache window | Cache issuer metadata/JWKS with bounded refresh and rotation overlap; fail safely for unrecognized signature/key conditions. | Rotate active signing key; valid new token succeeds after refresh, forged key does not. |
| Token subject maps to deactivated/deleted local account | Local account status is checked after token verification; external token validity alone does not restore access. | Deactivate account, present previously valid token; request is denied and audited. |
| Invitation acceptance races invitation cancellation or expiry | Validate hashed token, status, expiry, target identity, and idempotency in the same transaction that creates access. | Simultaneous accept/cancel/expiry attempts cannot produce a live unauthorized grant. |
| Error response reveals cross-profile resource existence | Apply explicit disclosure policy (`404` or `403`) before loading/serializing foreign resource detail; audit both results. | Fuzz resource IDs across profiles; no metadata, timing artifact, or response detail identifies existence. |

Object-level authorization must be evaluated for every client-supplied resource identifier; opaque UUIDs are not authorization controls.[4]

## 6. Restricted evidence, deletion, and ML-safety coverage

| Edge case to cover | Required implementation control | Required automated proof |
|---|---|---|
| Retention purge races an active scan stage | Purge marks a durable deletion/hold state before physical asset removal. Worker checks state before input fetch and before output commit. | Begin stage, request purge, then complete stage; no new review payload/result becomes visible. |
| An upload completes after document cancellation | Object completion validates document state and upload nonce/checksum; orphaned objects are lifecycle-cleaned. | Complete a revoked/cancelled upload; attachment is rejected and object is quarantined/deleted. |
| Same source bytes are uploaded twice | Deduplication may reuse an object only within compatible encryption/access/retention scope; never leak an object reference across profiles. | Identical hash in two profiles produces isolated asset references and authorization. |
| Model output includes unexpected sensitive content or prompt injection text | Treat model output as untrusted data; schema validate, bound size, redact logs, and keep policy deterministic. | Model output with oversized/unrecognized fields cannot alter policy, logs, or UI beyond approved safe representation. |
| Catalog/index release is retired while a reviewed payload waits | Review confirmation validates payload release and candidate compatibility, then requires refresh/review if policy declares it obsolete. | Confirm old payload after release retirement; command follows documented compatible/superseded policy rather than silently remapping product. |
| User cancellation races final evidence commit | Stage completion compares cancellation/version state inside commit transaction. Cancellation wins when requested before commit; completed evidence remains auditable but cannot create a review command. | Interleave cancellation and final stage transaction repeatedly; no regimen path is emitted from cancelled work. |

## 7. Security observability and operational containment coverage

Logs, metrics, traces, DLQ payloads, and audit records have different purposes and retention rules. An implementation should assert both that expected security events are emitted and that prohibited restricted data is absent. This is especially important for exception serialization, provider SDK debug modes, and distributed trace attributes.

| Edge case to cover | Required implementation control | Required automated proof |
|---|---|---|
| Exception handler serializes request/model/provider body | Use field allowlists and redaction at logger, error mapper, and telemetry exporter boundaries. | Trigger provider and validation failures containing OCR text/token-like values; inspect sinks for absence. |
| Secret rotation reaches only part of a worker fleet | Version secret/config references, expose reload success metric, and drain/restart stale workers before old credential expiry. | Rotate a test secret; all worker identities report new version without queue-wide failure storm. |
| Alert flood obscures critical incident | Deduplicate/rate-limit alerts by queue/error class while escalating age and user-impact separately. | Simulate retry storm; one actionable incident is opened while queue-age/user-impact alerts still surface. |
| Operator requeues a DLQ event after access/release change | Recovery action stores operator identity/reason and creates fresh evaluation from authoritative state. | Requeue stale event; it is superseded/cancelled rather than executed with old payload. |
| Break-glass/admin tooling bypasses routine guardrails | Keep it outside MVP unless separately designed; if introduced, require distinct authority, limited duration, immutable audit, and post-event review. | No ordinary admin/team role can invoke break-glass or bypass profile policy. |

## 8. Priority acceptance suite

The first implementation milestone should include a focused chaos/integration suite that executes the controls most likely to create duplicate external effects or unauthorized access: post-publish relay crash, duplicate task delivery, provider-response loss, worker pause after lease, profile revocation during queued work, RLS connection-pool reuse, purge-versus-stage completion, stale idempotency replay, and release/version incompatibility. The suite should run against real PostgreSQL, object storage, and broker behavior in staging rather than mocks alone.

## References

[1] [Transactional Outbox Pattern, Microservices.io](https://microservices.io/patterns/data/transactional-outbox.html)

[2] [Celery Tasks: idempotence, acknowledgements, retries, routing, and logging](https://docs.celeryq.dev/en/stable/userguide/tasks.html)

[3] [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

[4] [OWASP API1:2023 — Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
