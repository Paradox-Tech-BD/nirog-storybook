# Technical Analysis Overview: Slide Deck Structure

**Audience:** Backend, mobile, platform, product, and technical-advisory stakeholders.  
**Suggested duration:** 10–12 minutes.  
**Deck length:** 12 slides, including cover and close.  
**Companion document:** [`technical-analysis-presentation-script.md`](./technical-analysis-presentation-script.md).

## Cover

**Nirog Technical Architecture**  
**Safe evidence-assisted medication management**

## Slide 1

**Technical Decisions Become Safety Controls**

- Convert product boundaries into enforceable ownership, policy, and data controls.
- Keep uncertain prescription interpretation separate from confirmed medication action.
- Build one reliable backend foundation before optimizing organizational complexity.

## Slide 2

**One Core, Clear Module Ownership**

- FastAPI modular monolith provides one coherent command transaction boundary.
- PostgreSQL schemas separate identity, catalog, evidence, regimen, adherence, and platform state.
- Modules integrate through explicit commands and versioned events—not direct foreign-table writes.

## Slide 3

**Every Command Starts With Current Authority**

- OIDC establishes account identity; it does not grant patient-profile access.
- Server policy evaluates owner/caregiver grant, consent, permissions, and resource relationship.
- Repository scoping and RLS reinforce the decision; audit captures sensitive allow/deny outcomes.

## Slide 4

**ML Produces Evidence, Not Therapy**

- Stage workers preserve source, extraction, candidate, policy, and release lineage.
- Confidence routes the review experience rather than bypassing it.
- Only an authenticated, evidence-version-checked confirmation creates a regimen version.

## Slide 5

**Async Work Is Safe Under Duplicate Delivery**

- Domain command, audit, idempotency result, and outbox event commit together.
- Consumer ledger deduplicates at-least-once delivery and records retry/terminal state.
- Workers re-read current authority and aggregate state before an owned effect.

## Slide 6

**Failure Handling Is Explicit**

- Temporary faults receive bounded retry with jitter, expiry, and provider circuit control.
- Stale, revoked, corrupt, and policy-blocked work ends safely without loops.
- Unknown provider outcomes reconcile by deterministic request key before any resend.

## Slide 7

**Static Review Extends the Acceptance Suite**

- Validate relay-lease fencing, broker acknowledgement loss, event ordering, and worker pause races.
- Test RLS connection-pool isolation, profile revocation during queued work, and purge-versus-stage completion.
- Assert redaction across errors, logs, traces, DLQ records, and provider SDK diagnostics.

## Slide 8

**Migrations Establish Reliable State First**

- Add platform schema/roles, outbox, consumer ledger, provider intent, DLQ, and reconciliation records.
- Deploy additive compatible structures before workers or relays rely on them.
- Activate by canary queue; retain an expand–migrate–contract rollback window.

## Slide 9

**Scale Workloads Independently**

- API, relay, ML, projections, notifications, catalog/indexing, and maintenance use separate limits.
- Queue age, task duration, provider quota, cost, and database capacity guide scaling.
- Backpressure preserves manual entry, current regimen access, and dose logging during saturation.

## Slide 10

**Operations Protect Timeliness and Trust**

- Traces connect commands, events, worker attempts, provider calls, review payloads, and confirmations.
- Dashboards expose queue age, retry/DLQ rate, release outcomes, delivery state, and authorization anomalies.
- Backups and restore drills rebuild derived work from authoritative PostgreSQL state.

## Slide 11

**Build the Safe Core Before Automation**

- Establish identity, profile policy, audit, idempotency, and module boundaries first.
- Add catalog releases, regimen/adherence commands, and asynchronous projections next.
- Widen ML only after evaluation, observability, rollback, and manual fallback are proven.

## Slide 12

**Reliable Assistance, Controlled Action**  
**Evidence remains reviewable; medication action remains user-confirmed.**
