# Nirog Current Project State and Access Setup

**Status date:** 20 August 2026  
**Purpose:** practical handoff for the current implementation boundary, the remaining safe delivery order, and the distinction between administrator, team, and patient-care access.

> **Core rule:** “Admin” is not a single Nirog permission. Platform administration, workforce/editorial activity, collaboration-team membership, and access to a patient profile are separate authority planes. No one receives patient data merely because they are an administrator elsewhere in the system.

## 1. Current deployed baseline

| Repository or runtime | Current state | What it proves |
|---|---|---|
| `nirog-core` | `main` at `7a29173` | The Core includes the deployed platform-role authority plane, manual medication commands, the evidence/OCR-job foundation, and a secret-authenticated worker-facing OCR boundary with profile-scoped RLS policies. The normal API still exposes no first-administrator bootstrap route. |
| Railway Core API | Online with `7a29173` active | Clinical migration `0010_ocr_worker_boundary.sql` completed first through the migrator, then the matching API revision became active. Public liveness returned HTTP `200`. |
| `nirog-web` | `main` at `3ac4be0` | The Next.js bridge normalizes the Core API base to `/api/v1`, forwards the current Clerk session token, and renders the current account result. |
| Live Nirog Web | Verified with the preserved signed-in session | Repeated `Refresh record` requests render the verified empty-profile state, preferences, and a correlation ID rather than `401`, `404`, or `500`. |
| `nirog-storybook` | Canonical `main` and deployment `next` | The incident history, architecture decisions, implementation plans, and this handoff are documented in the canonical repository and deployment branch. |

The live empty-profile message is expected for the tested user: the authenticated account projection and default preferences exist, while no patient profile has yet been created. It is not an error condition.

## 2. What is implemented now

The current slice establishes a secure identity and profile-authority foundation. Clerk verifies authentication. Nirog Core creates or finds the local `(issuer, subject)` account projection, establishes RLS values inside one native Drizzle transaction, and evaluates either profile ownership or a persisted delegated-grant permission snapshot. The system deliberately keeps collaboration teams separate from patient-data authority.

| Capability | Current availability | Operational meaning |
|---|---|---|
| Clerk sign-in and Core verification | Live | A user who signs in can obtain a local Core account projection through `GET /api/v1/me`. |
| Default account preferences | Live | The account receives safe defaults that can be updated through the validated preferences route. |
| Patient profile creation and updates | API implemented | The authenticated account becomes the implicit owner of a created profile. |
| Delegated profile grants | API implemented | The owner can create, list, and revoke bounded `caregiver`, `curator`, or `viewer` grants. |
| Team creation | API implemented | An authenticated account can create a collaboration team and becomes its team owner. |
| Team invitations and member onboarding | API implemented and deployed | Direct-account invitations support create, accept, decline, cancel, idempotency, default/maximum expiry, audit/outbox evidence, and PostgreSQL RLS enforcement. A team role remains non-clinical. |
| Platform staff administration | API implemented and deployed | A separate `platform.platform_role_assignments` model supports `platform_admin`, `support_agent`, and `security_auditor` assignments. The public API is active-admin-only and adds no profile, evidence, medication, prescription, consent, or other clinical authority. |
| Clerk lifecycle webhooks | Development activation verified | The public `/api/v1/integrations/clerk/webhooks` route preserves raw payload bytes, verifies the Svix signature with Clerk’s supported verifier, records supported lifecycle deliveries idempotently, and emits audit/outbox evidence. The Nirog Development endpoint subscribes only to `user.created`, `user.updated`, and `user.deleted`; its protected Railway signing secret is active, and a real `user.created` delivery received HTTP `202` from Core. |
| Device lifecycle | API implemented and deployed | An authenticated account may register/reactivate an `ios`, `android`, or `web` device and revoke only its own active device. Device fingerprints and optional push tokens are SHA-256 hashed before persistence and never appear in API responses, audit metadata, or outbox payloads. |
| Consent lifecycle | API implemented and deployed | Only the profile owner may create or withdraw an active, purpose-bound consent for `data-sharing`, `research`, or `marketing`. The action is bound to the active profile/account RLS context and emits audit/outbox evidence. |
| Manual medication, prescription, regimen, schedule, and dose outcomes | API implemented and deployed | Authorized callers can list manual regimens and create manual prescriptions, regimens with bounded local schedules, and dose outcomes. Every mutation requires an idempotency key and emits only safe identifiers in audit/outbox evidence. |
| Prescription evidence and OCR-job foundation | API implemented and deployed | Authorized owners may request bounded R2 upload authorization, declare a profile-bound evidence upload complete, list safe metadata, and atomically enqueue an OCR job reference. Public object URLs, raw bytes, extraction text, and model output remain unavailable. |
| OCR worker lease/result and extraction review | API boundary implemented and deployed | A sealed-secret worker caller can acquire a hashed opaque lease, obtain a short-lived R2 read authorization, submit bounded results, and trigger Core-owned retry/dead-letter state. Authorized profile users can list and explicitly accept/reject stored extraction candidates without changing a regimen. |
| Concrete OCR-engine worker peer | Deliberately deferred | No worker process currently consumes dispatcher jobs, performs OCR, or has the sealed credential. Object metadata verification, provider selection, worker observability, and direct lease/stale-token integration tests remain separate work. |

## 3. Roles that exist today

### Patient-profile roles: implemented and clinically meaningful

The following roles apply to **one patient profile only**. They are not global accounts roles. At creation, Core saves the role’s exact permission snapshot inside the grant; later changes to a template do not silently broaden historical grants.

| Profile role | Current permissions | Appropriate person |
|---|---|---|
| `owner` | All current profile, document, regimen, adherence, notification, and sharing permissions | The person who creates and controls the profile. Ownership is implicit, not stored as a duplicate grant. |
| `caregiver` | Read profile and clinical-document evidence; read/write adherence; manage notifications; read regimen | A trusted caregiver who helps with day-to-day medication support. |
| `curator` | Read profile/document metadata/regimen/adherence | A limited reviewer who does not need images, notification control, or write access. |
| `viewer` | Read profile, regimen, and adherence | A narrow read-only observer. |

These roles are the only current path to patient-data authority besides ownership. A team role, Clerk dashboard role, selected profile in a client, or UI state does not replace a profile grant.[1]

### Collaboration-team roles: implemented, but non-clinical

The current team model has `owner`, `admin`, and `member` records. The creator of `POST /api/v1/teams` becomes its `owner`. These roles are intended for collaboration and future team workflow administration only. They **do not** grant access to a patient profile; a team administrator still needs an explicit profile grant to read patient data.

Team owners may invite either `admin` or `member` accounts. Active team administrators may invite and cancel `member` invitations only; they cannot assign another administrator. The intended account alone may accept or decline its direct invitation. Invitation expiry defaults to seven days and is bounded to 30 days. Do not manually insert members into Neon or treat a team row as a patient-data grant.

### Platform roles: implemented, deliberately non-clinical

Core now supports `platform_admin`, `support_agent`, and `security_auditor` assignments only in the separate `platform.platform_role_assignments` authority plane. Active platform administrators may list, create, and revoke those **non-clinical** assignments through `/api/v1/platform/role-assignments`; mutations require idempotency keys and emit safe audit/outbox evidence. An active administrator has no patient-profile, evidence, medication, prescription, consent, or clinical-record permission by virtue of that assignment. The disposable PostgreSQL suite proves an active platform administrator cannot see an unrelated patient profile.[2]

The first administrator is not created through HTTP. The migrator offers a one-time operator command that requires temporary sealed `PLATFORM_BOOTSTRAP_ENABLED=true` and `PLATFORM_BOOTSTRAP_ACCOUNT_ID` values, refuses to run for a non-migrator runtime or after any active platform administrator exists, and must be disabled immediately after successful use. No initial administrator has been configured as part of this release.

## 4. How to set people up today

The following current workflow is safe and supported by the present implementation.

| Desired outcome | Safe action now | Important boundary |
|---|---|---|
| Create a Nirog account | Have the person sign in through Clerk. Their first successful Core request creates the local account projection. | Sign-in creates an account projection, not a patient profile or elevated role. |
| Make someone a profile owner | Have that person create their own patient profile through the implemented profile flow. | Ownership is profile-specific and cannot be assigned by declaring a global administrator. |
| Let a trusted person help with one profile | Use the profile-owner grant flow with `caregiver`, `curator`, or `viewer` after the recipient has a local account. | The grant must be created through the authorized API and should include a stated purpose and, where appropriate, expiry. |
| Create a collaboration workspace | Create a team through `POST /api/v1/teams` using an idempotency key. | The creator is team owner, but team membership does not grant patient-data access. |
| Add a team administrator or member | Use `POST /api/v1/teams/:teamId/invitations` with an idempotency key and the recipient’s local account ID. The recipient uses the dedicated accept or decline route. | A team owner may invite `admin` or `member`; a team admin may invite only `member`. Do not perform manual database edits or infer membership from a Clerk Organization. |
| Register or revoke a device | Use `POST /api/v1/devices` or `DELETE /api/v1/devices/:deviceId` with an idempotency key. | The authenticated account controls only its own devices. Send a client fingerprint and optional push token only over the authenticated API; Core stores SHA-256 digests, never raw token material. |
| Record or withdraw consent | As the profile owner, use `POST /api/v1/profiles/:profileId/consents` or `DELETE /api/v1/profiles/:profileId/consents/:consentId` with an idempotency key. | Valid purposes are `data-sharing`, `research`, and `marketing`. A consent record does not create a profile grant or patient-data access by itself. |
| Make a platform administrator | After a target person has a local Core account projection, use the operator-only bootstrap command exactly once, then use the active-admin API for subsequent role assignments. | Keep temporary bootstrap configuration disabled outside the operator run. A platform assignment is never a patient-data grant. |

The current Web companion confirms account projection and empty-profile state. It does not yet provide a full administrative console for profile grants, teams, invitations, or staff. Use Scalar’s documented invitation routes only for controlled test operations until the Web companion exposes these flows; do not bypass Core with direct database changes.[3]

## 5. Deployed administrator model

The next administration implementation should create four separate planes rather than one catch-all “admin” flag.

| Authority plane | Proposed roles | Default patient-data access | Implementation home |
|---|---|---|---|
| Platform operations | `platform_admin`, `support_agent`, `security_auditor` | None | Core `platform_role_assignments` with explicit audit and a bootstrap workflow. |
| Workforce/editorial | `catalog_editor`, `catalog_reviewer`, `catalog_publisher` | None | Bounded Strapi or an equivalent workforce plane, with signed release handoff to Core. |
| Collaboration | `team.owner`, `team.admin`, `team.member` | None | Existing Core teams and deployed direct-account invitation lifecycle. |
| Patient care | `owner`, `caregiver`, `curator`, `viewer` | Exactly the persisted profile-grant snapshot | Existing Core profile-grant model. |

The deployed `platform.platform_role_assignments` record carries account ID, role code, assignment/revocation lifecycle, actor identifiers, reason, and expiry metadata. It is RLS-protected with an isolated security-definer active-admin predicate. The one-time bootstrap command assigns the first `platform_admin` to a verified local account without embedding an email, Clerk user ID, or secret in source control; its temporary enablement variables must be removed after the operator run.

The Core API separately authorizes idempotent staff-role listing, assignment, and revocation. A `platform_admin` may manage only platform assignments and still has **no default** access to profile evidence, medication history, or clinical records. Any justified exceptional access remains a future break-glass, purpose-bound PBAC decision with independent audit evidence—not a normal administrator capability.

Clerk Organization roles may be used later as a sign-in and navigation convenience for workforce applications, but Core must receive them only through a verified, replay-safe Svix webhook and map them to local assignments after validation. They must never be the direct authorization source for patient data.[4]

## 6. Recommended next delivery order

The immediate technical order protects identity and authorization before the medication/OCR product surface grows.

1. **Begin medicine, prescription, and OCR delivery.** Introduce catalog, prescription, regimen, dose, reminder, evidence, and bounded asynchronous OCR contracts now that the user/access release boundary is complete.

The first medication milestone is complete: Core commit `2acf528` supplies a profile-scoped manual prescription/regimen/dose vertical slice. Core commit `d6d5505` adds opaque R2 upload authorization, safe evidence metadata, and identifier-only OCR-job dispatch. Core commit `7a29173` adds the authenticated lease/read/result and explicit extraction-review API boundary, backed by migration `0010`. The next concrete worker work must remain bounded to Core-issued job references and this sealed route family. It must not make a platform role, a worker, a client-selected profile, or a raw evidence URI an authorization shortcut.

This order keeps clinical and ML workloads from depending on incomplete human-access controls. The existing outbox and dispatcher architecture can then carry OCR job references and notification work without letting an ML worker become a patient-data authority.[5]

## 7. Immediate decisions for the project owner

Before invoking bootstrap, decide who will be the first operational administrator, who can approve additional staff assignments, which support functions are allowed, whether every support action requires a consent/purpose record, and whether any break-glass process is permitted. Record these decisions as policies, not as ad hoc database edits.

For the current test environment, continue creating test users by Clerk sign-in and use profiles plus explicit profile grants for any patient-care sharing test. Treat the future `platform_admin` as a distinct development task requiring approval before implementation.

## References

[1] [Nirog access permission registry](https://github.com/Paradox-Tech-BD/nirog-core/blob/main/packages/access/src/index.ts)

[2] [Nirog platform decision and bounded Strapi boundary](00-platform-decision-and-boundaries.md)

[3] [Nirog Clerk user-subsystem implementation](08-clerk-user-subsystem-implementation.md)

[4] [Clerk user synchronization guidance](https://clerk.com/docs/guides/development/webhooks/syncing)

[5] [Nirog Railway PostgreSQL outbox deployment](12-railway-postgresql-outbox-deployment.md)
