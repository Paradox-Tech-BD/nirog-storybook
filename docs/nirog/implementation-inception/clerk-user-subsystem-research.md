# Clerk-Authenticated User Subsystem — Research Notes

## Clerk backend-verification finding

The Flutter or web frontend sends a Clerk session JWT to Nirog Core in the `Authorization: Bearer` header. Nirog Core must not trust decoded client claims. Clerk’s Fastify integration can locate a session JWT in headers or cookies and attach validated authentication information to the request. [1] Clerk recommends `authenticateRequest()` for request-level authentication; `verifyToken()` is lower-level and intended for advanced cases. [2] [3]

The Nirog Core integration will use a small adapter over the official `@clerk/backend` client, registered in Fastify’s request lifecycle. The adapter receives the raw Fastify request and invokes Clerk request authentication with the configured publishable key, server secret key where required, configured audience, explicit `authorizedParties`, and a configured JWT public key when networkless verification is enabled. The adapter exposes only a typed, verified identity to application code: Clerk user ID (`sub`), session ID (`sid`), issuer (`iss`), authorized party (`azp` if supplied), session status (`sts`), and safe correlation metadata.

> **Nirog decision:** The core does not send every JWT to Clerk as an opaque introspection request. It uses Clerk’s supported verification path. With a configured `CLERK_JWT_KEY`, signature verification is networkless; otherwise Clerk obtains and caches the JWKS. The backend validates signature, time claims, issuer through Clerk verification, configured audience, and the allowed frontend origins. A malformed, expired, pending, or unauthorized-party token yields a safe `401`, without leaking the failure detail.

## Claims and local authority

Clerk session tokens are short-lived JWTs. The default identity claim is `sub`; `sid` identifies the session; `iss` identifies the Clerk instance; `azp` represents the frontend origin; `exp`, `nbf`, and `iat` control validity; and `sts` can indicate a pending session. [4] Current organization claims may be compact and are not appropriate as Nirog clinical authority. Nirog therefore treats Clerk as the authentication authority only.

The Nirog Core database remains the authorization and health-domain authority. It maps the verified immutable `(issuer, subject)` pair to `identity.accounts.clerk_user_id`, keeps its own account state, patient profiles, preferences, profile grants, consent, team relationships, invitation status, role-template versions, and persisted permission snapshots. Clerk Organization or public-metadata claims never replace local `ProfileCapability` evaluation.

## Supplied UML reconciliation

The supplied model defines User, AuthProvider, AuthType, UserPreference, PatientProfile, Team, TeamMember, TeamInvitation, ProfileAccess, BloodType, UserRole, and InvitationStatus. It maps to Nirog Core as follows.

| Supplied concept | Nirog Core record or decision |
|---|---|
| `User` | `identity.accounts`; no password hash, local login, refresh token, or account token pair because Clerk authenticates sessions. |
| `AuthProvider` and `AuthType` | `identity.auth_identities`, a local immutable provenance/linked-provider projection keyed by account and Clerk user ID; no provider credential hashes or external access tokens are stored. |
| `UserPreference` | `identity.account_preferences`, one row per account, non-clinical UI/reminder defaults only. |
| `PatientProfile` | `identity.patient_profiles`, profile owner account, demographic minimum, time zone, and lifecycle state. |
| `Team`, `TeamMember`, `TeamInvitation` | `identity.teams`, `identity.team_members`, `identity.team_invitations`; workforce/team relationships do **not** grant patient access by themselves. |
| `ProfileAccess` | Existing `identity.profile_access`, the sole delegated patient-profile grant with persisted `permission_set`, status, expiry/revocation, consent/purpose gates, and audit history. |
| `UserRole` | Separate role-template code for a grant/team membership. A role is never the authorization decision; capability checks evaluate a persisted grant snapshot plus live relation/consent/state. |
| `InvitationStatus` | `pending`, `accepted`, `declined`, `expired`, `cancelled`; only an accepted invitation produces a membership/grant in one idempotent transaction. |
| `BloodType` | Optional health profile field under explicit patient update permission; not an authentication/authorization attribute. |

## Sources

[1] [Clerk Fastify `clerkPlugin()` reference](https://clerk.com/docs/reference/fastify/clerk-plugin)

[2] [Clerk `verifyToken()` backend reference](https://clerk.com/docs/reference/backend/verify-token)

[3] [Clerk manual JWT verification guide](https://clerk.com/docs/guides/sessions/manual-jwt-verification)

[4] [Clerk session token claims](https://clerk.com/docs/guides/sessions/session-tokens)
