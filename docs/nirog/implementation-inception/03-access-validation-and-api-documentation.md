# Access, Validation, and API Documentation

## 1. HTTP stack

Nirog Core runs Fastify 5 with TypeBox schemas and the Fastify TypeBox type provider. Fastify compiles JSON Schema validation and response serialization; declared response schemas also reduce accidental disclosure of fields that a presenter should not expose. [1] [2]

TypeBox is selected over Zod at the Fastify route boundary because it produces JSON Schema directly, works with Fastify’s native compiled validator and serializer, and becomes the OpenAPI source. This does not make the route schema the sole business validator. Domain commands and application handlers still enforce authorization, relation, consent, state, concurrency, and aggregate rules.

```mermaid
sequenceDiagram
  autonumber
  participant Client as Flutter or workforce client
  participant HTTP as Fastify route + TypeBox
  participant Actor as OIDC actor resolver
  participant Access as Profile policy service
  participant Command as Application command handler
  participant DB as Drizzle transaction + RLS
  participant Docs as OpenAPI + Scalar

  Client->>HTTP: Request + bearer token + idempotency key
  HTTP->>HTTP: Validate body, params, query, headers
  HTTP->>Actor: Verify issuer, JWKS, audience, account status
  Actor->>Access: Require(profile, permission, resource, purpose)
  Access->>Command: Immutable ProfileCapability or safe deny
  Command->>DB: SET LOCAL context; state/idempotency/constraint checks
  DB-->>Command: Commit aggregate + audit + outbox
  Command-->>HTTP: Typed success or safe problem
  HTTP-->>Client: Serialized response only
  HTTP->>Docs: Route schemas contribute to OpenAPI
```

## 2. Layered validation contract

Each command follows the fixed validation order below. A route handler is successful only after every applicable gate has passed. Fastify warns against doing database work in initial schema validation; Nirog therefore performs asynchronous access and relation checks after transport parsing. [1]

| Gate | Owner | Examples |
|---|---|---|
| Transport | Fastify + TypeBox | JSON content type, body/params/query/header shape, maximum payload size, unknown-field policy. |
| Configuration | `packages/config` | Required secrets/endpoints, URL allowlists, runtime environment, feature flags. |
| Actor | OIDC adapter | JWKS signature, issuer, audience, expiry, subject-to-account mapping, account/session status. |
| Capability | Access service | Owner/grant resolution, persisted permission snapshot, profile scope, grant expiry/revocation. |
| Resource relation | Owning module | Document/regimen/occurrence belongs to exact profile and expected aggregate. |
| Consent and purpose | Consent/access service | Raw evidence, sharing, retrieval, and export purpose gates. |
| State and concurrency | Command handler | Version/ETag, regimen status, review state, device state, active release. |
| Idempotency | Platform service | Same scope/key returns prior safe receipt; mismatched payload is rejected. |
| Persistence | PostgreSQL | RLS, FK, check, unique, exclusion, and transaction constraints. |
| Audit and event | Platform service | Redacted audit event and transactional outbox row exist before success response. |

All errors use RFC 9457-style `application/problem+json` with a stable public problem code, correlation ID, retry guidance where safe, and no SQL/authorization detail. Log events contain the internal reason code, never access tokens, raw prescription images, prompt content, or provider credentials.

## 3. RBAC now and PBAC later

`packages/access` defines the following stable interfaces: `ActorContext`, `ResourceRef`, `AuthorizationRequest`, `ProfileCapability`, `AuthorizationDecision`, `PermissionRegistry`, `ProfilePolicyService`, and `PolicyEvaluator`. Runtime code requests `requireCapability(request)`; it never checks `if (role === 'manager')`.

The initial `RbacProfilePolicyEvaluator` resolves an owner relationship or live `identity.profile_access` grant, evaluates the **persisted permission snapshot**, proves resource/profile relation, then applies consent/purpose/state gates. `PolicyEvaluator` later composes a policy decision point that can add trusted attributes such as device trust, time window, classification, consent category, or workload assurance. The first PBAC rollout is constrain-only and shadow-evaluated: it can deny a request otherwise permitted by RBAC, but cannot broaden a persisted grant or bypass an existing gate.

OIDC is validated by `jose` against an allowlisted issuer and audience. Nirog Core maps `(issuer, subject)` to a local `identity.accounts` row; mobile tokens never carry permissions or profile access as authority. Workforce Strapi identities use a separate issuer and never map into a patient profile capability.

## 4. Scalar and OpenAPI implementation

Fastify route schemas create the canonical OpenAPI document through `@fastify/swagger`; `@scalar/fastify-api-reference` serves an interactive reference from that document. [3] The production endpoints are `/openapi.json` and `/reference`. The reference is either protected by an operations/developer access policy or network-restricted; it does not expose internal workload routes, private schemas, credentials, or raw operational examples.

| Artifact | Generation | Governance |
|---|---|---|
| Route contract | TypeBox schema adjacent to route registration | Requires request, response, tags, summary, security, and error responses. |
| OpenAPI JSON | `pnpm openapi:write` from running schema registration | Committed snapshot reviewed in pull requests. |
| Scalar UI | Fastify plugin reading `/openapi.json` | Serves only public/mobile and documented workforce APIs. |
| Lint and breaking-change report | Redocly CLI in CI | Fails undocumented operations, invalid references, and unapproved breaking contract changes. |
| Flutter client | Generated from published, versioned OpenAPI release | Regenerated in a dedicated client update; never hand-edited generated code. |

Internal worker routes use a distinct OpenAPI document or are excluded from the public document. Their contract lives in `packages/contracts` and is tested by producer/consumer contract tests. The public route prefix is `/api/v1`; incompatible changes require a new versioned surface or a published mobile compatibility window.

## 5. Example route-to-command pattern

```text
POST /api/v1/profiles/:profileId/prescriptions
  1. TypeBox parses metadata and signed-upload receipt reference.
  2. OIDC resolver produces ActorContext.
  3. Access service requires document.create for the exact profile.
  4. Prescription application handler validates storage receipt ownership, consent,
     content classification, upload checksum, idempotency, and profile state.
  5. One transaction creates document + scan job + audit + outbox event.
  6. Response uses an explicit document receipt schema; no object key is returned.
```

## References

[1] [Fastify validation and serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)

[2] [Fastify Type Providers](https://fastify.dev/docs/latest/Reference/Type-Providers/)

[3] [Scalar API Reference for Fastify](https://scalar.com/products/api-references/integrations/fastify)

[4] [Nirog RBAC baseline](../software-access-architecture/01-rbac-baseline.md)
