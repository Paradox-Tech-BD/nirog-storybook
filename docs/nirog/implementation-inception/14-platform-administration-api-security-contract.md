# Platform Administration API and Security Contract

**Status:** implementation contract for the next bounded Core increment  
**Authority plane:** platform operations only  
**Clinical default:** no patient-data access

> A platform role is an operational assignment, not a patient-profile grant. It must never authorize a profile, evidence, medication, prescription, consent, dose, reminder, or OCR read/write operation by itself.

## 1. Role model

The first delivery persists only locally assigned, time-bounded platform roles. It does not accept a Clerk Organization role, browser claim, email address, or frontend-selected role as authorization evidence.

| Role | Permitted platform operation | Explicitly excluded |
|---|---|---|
| `platform_admin` | Bootstrap successor administrators; create, list, and revoke platform-role assignments. | All patient-profile and clinical-domain operations, evidence access, consent management, and profile-grant management. |
| `support_agent` | Reserved assignment only in this increment; no privileged Core route is exposed yet. | All patient-data and operational-write access. |
| `security_auditor` | Reserved assignment only in this increment; no audit-query route is exposed yet. | Patient data, raw webhook payloads, tokens, secrets, and operational writes. |

Reserved roles are persisted for controlled rollout, but assigning one does not make an unimplemented route available. New operations require a later explicit capability decision.

## 2. Public Core API draft

All public routes are under `/api/v1`, require a verified Clerk bearer token and an `Idempotency-Key` for mutations, return the shared success/problem envelopes, and publish `bearerAuth` security in Scalar/OpenAPI.

| Method and path | Caller | Request / result | Security rule |
|---|---|---|---|
| `GET /platform/role-assignments` | Active `platform_admin` | Optional `accountId` and active-status filter; returns safe assignment projections. | Never returns email addresses, Clerk subjects, patient profile IDs, audit payloads, tokens, or clinical data. |
| `POST /platform/role-assignments` | Active `platform_admin` | `{ accountId, roleCode, reason, expiresAt? }`; returns the new active assignment. | The target must be an existing local account. The caller cannot assign an unknown role, backdate an expiry, or silently change an existing assignment. |
| `DELETE /platform/role-assignments/:assignmentId` | Active `platform_admin` | No body; returns `204`. | Revokes an active assignment only. The final active `platform_admin` cannot be revoked through the public API. |

The create request permits `platform_admin`, `support_agent`, and `security_auditor`. A duplicate active `(accountId, roleCode)` assignment is rejected rather than treated as an implicit update. Re-assignment after revocation creates a new immutable assignment record and new audit/outbox evidence.

## 3. Bootstrap is operational, not public HTTP

There is deliberately **no** `POST /platform/bootstrap` browser endpoint. The first `platform_admin` is created by a one-time, operator-run Core command using a local account UUID, a sealed bootstrap secret, a mandatory reason, and a database transaction. The command succeeds only while no active `platform_admin` exists, writes a normal assignment/audit/outbox trail, and refuses subsequent execution. The secret is held only in deployment configuration; its value, account target, and invocation transcript are never committed or documented.

## 4. Non-clinical enforcement rules

| Layer | Required rule |
|---|---|
| HTTP registration | Platform routes are mounted in a separate `platform-administration` feature. They do not import profile, medication, evidence, consent, or OCR application ports. |
| Application authorization | `requirePlatformRole('platform_admin')` reads only the local `platform_role_assignments` model and evaluates status/expiry. It does not invoke `PersistedGrantPolicyEvaluator` as a fallback. |
| Database RLS | Assignment rows are visible/mutable only to an active platform administrator. Clinical tables receive no policy that references platform roles. |
| Data model | Assignment records contain account ID, role, lifecycle timestamps, actor IDs, reason, and safe metadata only. They contain no patient-profile reference or clinical-purpose field. |
| Audit and outbox | Every bootstrap, assignment, and revocation is transactional with `platform.audit_events` and `platform.outbox_events`. Payloads contain assignment/account/role identifiers and never sensitive tokens or patient identifiers. |
| Break-glass | Not part of this increment. A future exceptional-access design must be purpose-bound, time-bounded, independently approved, and separately audited; it must not reuse platform administration as a shortcut. |

## 5. Required proof points

The API and migration tests must prove that an unauthenticated caller is rejected, a non-admin account cannot list/create/revoke assignments, an administrator may operate only on platform assignments, a final active administrator cannot be removed by the public route, and a platform-admin assignment does not make a patient profile visible through RLS. Disposable PostgreSQL coverage must assert the last condition against the migrated schema.

## References

[1] [Nirog current project state and access setup](13-current-project-state-and-access-setup.md)

[2] [Nirog verified Clerk user-subsystem implementation record](08-clerk-user-subsystem-implementation.md)
