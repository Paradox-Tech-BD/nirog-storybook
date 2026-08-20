# Nirog Current Project State and Access Setup

**Status date:** 20 August 2026  
**Purpose:** practical handoff for the current implementation boundary, the remaining safe delivery order, and the distinction between administrator, team, and patient-care access.

> **Core rule:** “Admin” is not a single Nirog permission. Platform administration, workforce/editorial activity, collaboration-team membership, and access to a patient profile are separate authority planes. No one receives patient data merely because they are an administrator elsewhere in the system.

## 1. Current deployed baseline

| Repository or runtime | Current state | What it proves |
|---|---|---|
| `nirog-core` | `main` at `098b762` | Fastify, TypeBox, Drizzle, PostgreSQL RLS, Clerk verification, account projection, profile grants, team creation, Scalar/OpenAPI, rate limits, R2 adapter, outbox dispatcher contracts, and the native Drizzle request-transaction correction are implemented. |
| Railway Core API | Online with `098b762` active | An authenticated request crosses the Web bridge, Clerk verifier, JIT account projection, RLS context, and Drizzle repository path successfully. |
| `nirog-web` | `main` at `3ac4be0` | The Next.js bridge normalizes the Core API base to `/api/v1`, forwards the current Clerk session token, and renders the current account result. |
| Live Nirog Web | Verified with the preserved signed-in session | Repeated `Refresh record` requests render the verified empty-profile state, preferences, and a correlation ID rather than `401`, `404`, or `500`. |
| `nirog-storybook` | `main` and `next` at `c13108ae45f` | The incident history, architecture decisions, implementation plans, and this handoff are documented in the canonical repository and deployment branch. |

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
| Team invitations and member onboarding | Not exposed yet | Supporting tables and repository methods exist, but safe create/accept endpoints and invitation delivery are deferred. |
| Platform staff administration | Not implemented | There is no global `platform_admin` role model or endpoint in Core today. |
| Clerk lifecycle webhooks | Not implemented | Svix-signed, replay-safe user lifecycle synchronization is the next identity hardening slice. |
| Device, consent, medicine, prescription, and OCR workflows | Not implemented as public product slices | The architecture and schema direction exist; their product routes and worker flows are still future work. |

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

### Collaboration-team roles: stored, but non-clinical

The current team model has `owner`, `admin`, and `member` records. The creator of `POST /api/v1/teams` becomes its `owner`. These roles are intended for collaboration and future team workflow administration only. They **do not** grant access to a patient profile; a team administrator still needs an explicit profile grant to read patient data.

Because invitation routes are not yet exposed, the safe current state is to create teams only for the account that created them. Do not manually insert members into Neon or treat a team row as a patient-data grant.

### Platform and workforce roles: deliberately not implemented

There is no production Core role called `platform_admin`, `support_agent`, `catalog_editor`, or `clinician` today. The bounded Strapi administration plane is for curated non-clinical catalog and editorial work; it is not a shortcut around Core’s profile grants. A future platform role must not create broad clinical visibility by default.[2]

## 4. How to set people up today

The following current workflow is safe and supported by the present implementation.

| Desired outcome | Safe action now | Important boundary |
|---|---|---|
| Create a Nirog account | Have the person sign in through Clerk. Their first successful Core request creates the local account projection. | Sign-in creates an account projection, not a patient profile or elevated role. |
| Make someone a profile owner | Have that person create their own patient profile through the implemented profile flow. | Ownership is profile-specific and cannot be assigned by declaring a global administrator. |
| Let a trusted person help with one profile | Use the profile-owner grant flow with `caregiver`, `curator`, or `viewer` after the recipient has a local account. | The grant must be created through the authorized API and should include a stated purpose and, where appropriate, expiry. |
| Create a collaboration workspace | Create a team through `POST /api/v1/teams` using an idempotency key. | The creator is team owner, but team membership does not grant patient-data access. |
| Add a team administrator or member | Wait for the invitation slice. | Do not perform manual database edits or attempt to infer membership from a Clerk Organization. |
| Make a platform administrator | Do not assign one in Core yet. Implement the dedicated platform-admin slice below first. | A global admin must remain distinct from clinical/profile authority. |

The current Web companion confirms account projection and empty-profile state. It does not yet provide a full administrative console for profile grants, teams, invitations, or staff. Until the invitation and staff slices exist, use the documented API contract in Scalar only for controlled test operations; do not bypass it with direct database changes.[3]

## 5. Recommended administrator model before implementation

The next administration implementation should create four separate planes rather than one catch-all “admin” flag.

| Authority plane | Proposed roles | Default patient-data access | Implementation home |
|---|---|---|---|
| Platform operations | `platform_admin`, `support_agent`, `security_auditor` | None | Core `platform_role_assignments` with explicit audit and a bootstrap workflow. |
| Workforce/editorial | `catalog_editor`, `catalog_reviewer`, `catalog_publisher` | None | Bounded Strapi or an equivalent workforce plane, with signed release handoff to Core. |
| Collaboration | `team.owner`, `team.admin`, `team.member` | None | Existing Core teams plus the future invitation lifecycle. |
| Patient care | `owner`, `caregiver`, `curator`, `viewer` | Exactly the persisted profile-grant snapshot | Existing Core profile-grant model. |

The implementation should include a new `identity.platform_role_assignments` record with assignment status, issuer, account ID, role code, granting actor, reason, expiry, creation and revocation timestamps, and an immutable audit/outbox trail. A one-time bootstrap command should assign the first `platform_admin` to a verified local account without embedding an email, Clerk user ID, or secret in source control. The command must be protected by an environment-specific operational procedure and disabled after use.

Core should then expose separately authorized, idempotent staff-role assignment and revocation commands. A `platform_admin` may manage staff accounts and configuration but should still have **no default** access to profile evidence, medication history, or clinical records. Any justified exceptional access must be designed as a future break-glass, purpose-bound PBAC decision with independent audit evidence—not as a normal administrator capability.

Clerk Organization roles may be used later as a sign-in and navigation convenience for workforce applications, but Core must receive them only through a verified, replay-safe Svix webhook and map them to local assignments after validation. They must never be the direct authorization source for patient data.[4]

## 6. Recommended next delivery order

The immediate technical order protects identity and authorization before the medication/OCR product surface grows.

1. **Add live PostgreSQL integration coverage.** Run migrations against a real disposable PostgreSQL database and test RLS owner/grantee isolation, JIT projection privileges, native transaction context, outbox atomicity, and migration repeatability.
2. **Implement Clerk Svix webhook ingestion.** Verify signatures, record provider-event idempotency, synchronize benign lifecycle information, and deactivate/revoke safely on lifecycle events.
3. **Implement directed team invitations.** Add create, accept, decline, cancel, and expiry operations; require recipient confirmation; issue auditable membership changes without granting patient data.
4. **Implement consent and device lifecycle.** Capture and revoke sharing consent explicitly; add device registration, encrypted push-token handling, and session/device revocation.
5. **Implement the dedicated platform-administration slice.** Add the separate platform-role model, bootstrap procedure, operational APIs, audit/outbox events, and no-clinical-access-by-default policy described above.
6. **Begin medicine, prescription, and OCR delivery.** Introduce catalog, prescription, regimen, dose, reminder, evidence, and bounded asynchronous OCR contracts only after the user/access release boundary is complete.

This order keeps clinical and ML workloads from depending on incomplete human-access controls. The existing outbox and dispatcher architecture can then carry OCR job references and notification work without letting an ML worker become a patient-data authority.[5]

## 7. Immediate decisions for the project owner

Before the platform-admin slice is implemented, decide who will be the first operational administrator, who can approve additional staff assignments, which support functions are allowed, whether every support action requires a consent/purpose record, and whether any break-glass process is permitted. Record these decisions as policies, not as ad hoc database edits.

For the current test environment, continue creating test users by Clerk sign-in and use profiles plus explicit profile grants for any patient-care sharing test. Treat the future `platform_admin` as a distinct development task requiring approval before implementation.

## References

[1] [Nirog access permission registry](https://github.com/Paradox-Tech-BD/nirog-core/blob/main/packages/access/src/index.ts)

[2] [Nirog platform decision and bounded Strapi boundary](00-platform-decision-and-boundaries.md)

[3] [Nirog Clerk user-subsystem implementation](08-clerk-user-subsystem-implementation.md)

[4] [Clerk user synchronization guidance](https://clerk.com/docs/guides/development/webhooks/syncing)

[5] [Nirog Railway PostgreSQL outbox deployment](12-railway-postgresql-outbox-deployment.md)
