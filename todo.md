# Nirog Software and Access Architecture

- [x] Review current modular-system, identity, profile authorization, security, validation, workflow, and data ownership contracts.
- [x] Research RBAC and policy-based access-control evolution patterns and define the Nirog-specific architecture taxonomy.
- [x] Write the new `docs/nirog/software-access-architecture/` documentation set with modular design, RBAC baseline, validation, audit, and future policy-extension guidance.
- [x] Add a grouped Software and Access Architecture branch to Storybook, build, and visually verify representative diagrams.
- [x] Commit and push the completed architecture library to `main`.

## Verification notes

The native Storybook build completed successfully after the final MDX adjustments on 18 August 2026. The new Software Architecture Overview, RBAC Baseline, Access Control Enforcement, Validation Architecture, and RBAC-to-PBAC Evolution pages render with their grouped navigation, readable MDX content, and Mermaid diagrams in the native preview.

The completed library was committed and pushed to `main` as `b54fde653d3` on 18 August 2026.

## Site visibility and publishing

- [x] Inspect the deployed branch, Storybook source configuration, navigation index, and all presentation-material source files.
- [x] Add or repair Storybook navigation pages so all documentation libraries and presentation materials are visibly discoverable.
- [x] Build and visually verify the complete Storybook site from the canonical source directory.
- [x] Push the visibility update to GitHub `main` and document the correct deployment settings/path.

### Deployment diagnosis

The canonical `main` branch holds the full Nirog documentation library and 65 Storybook pages, including the completed Software and Access Architecture section. The GitHub default branch remains `next`, which is highly divergent and exposes an older, incomplete Storybook set. The site-facing branch must be synchronized from the canonical Nirog source before the deployed Storybook can show all current materials.

The complete `docs/nirog` tree has been mirrored into the `next` deployment branch source as commit `d0a182197b9`, including all Storybook pages, presentation scripts, deck structure, diagrams, architecture libraries, and source-document links. Its native build completed successfully, and the deployment-branch preview now exposes all six Nirog documentation sections in navigation. The Pre-Analysis presentation script and the Technical Analysis presentation-material group, including the overview script and deck structure, are both visible and render correctly in the synchronized Storybook navigation.

The synchronized site-facing branch was pushed to GitHub as `next` at `d0a182197b9`. The canonical documentation branch was pushed as `main` at `806c39476ba`, and the GitHub repository default branch was changed from the incomplete `next` branch to `main` so repository visitors open the current complete library. Hosting should build from `main` with root directory `docs/nirog/pre-analysis/storybook`, install command `pnpm install --frozen-lockfile`, build command `pnpm build-storybook`, and output directory `storybook-static`.

## Storybook MDX rendering repair

- [x] Identify every Storybook MDX page with unsupported pipe-table markup and verify the affected rendering pattern.
- [x] Replace pipe-table markup with Storybook-compatible structured content while preserving all technical information.
- [x] Build and visually inspect representative repaired pages, including the reported workflow overview.
- [x] Publish the repair to GitHub `main` and the synchronized `next` hosting branch.

The supplied wide screenshot was inspected in two overlapping original-image crops. It confirms that the Workflow Library Overview page renders a Markdown table literally, including `| Workflow sequence | Design outcome |` and its pipe-delimited rows, rather than as structured content. The repository-wide Storybook MDX scan found the same unsupported pattern in exactly three overview pages: Workflow Library Overview, Data Management Overview, and Unified System Architecture Overview. Each is now rewritten as readable labelled prose, and the final syntax scan found no remaining pipe-led table markup. A clean native Storybook build completed successfully, and the repaired Workflow Library Overview was visually confirmed with its Mermaid diagram and labelled outcomes rendered correctly. The repair was pushed as `3b32c285163` on `main` and `8d6ef82360a` on `next`.

## Implementation technology stack

- [x] Reconcile the existing backend, ML, Flutter, privacy, RBAC, async, data, and operations decisions into implementation selection criteria.
- [x] Research and select a justified technology stack with versions, alternatives, and concrete integration boundaries.
- [x] Write the implementation-stack, local-development, quality/testing, operations, and developer-documentation decision set.
- [x] Add the new implementation stack to Storybook, build it, and verify representative pages.
- [x] Push the implementation selection library to GitHub `main` and synchronized `next`.

The decision library is written under `docs/nirog/implementation-stack/`. It defines the selected Python/FastAPI/PostgreSQL/Celery/Valkey/S3/OIDC/OpenTelemetry/OpenTofu/ECS Fargate baseline; exact layer and worker rules; the RBAC-to-PBAC, evidence-only ML, and Flutter/OpenAPI contracts; quality and CI controls; the Storybook plus OpenAPI/Redocly documentation split; and the first safe implementation milestones.

The expanded native Storybook build completed successfully. The `07 Implementation Stack` group is visible with five logical areas, and its overview plus quality/delivery pages rendered their selected-stack and CI-to-operations Mermaid diagrams correctly.

The complete implementation stack was published to GitHub as `81a794aff44` on canonical `main` and `e745592b7c0` on the synchronized site-facing `next` branch.

## TypeScript/Drizzle backend inception

- [x] Reconcile the TypeScript/Drizzle core and Python ML-worker split with the existing Nirog safety, ownership, RLS, Flutter, and RBAC/PBAC architecture.
- [ ] Research and select concrete Node/TypeScript, Drizzle, validation, Scalar, queue, AI/RAG, token-ledger, Docker, testing, and CI components.
- [ ] Write the detailed inception, schema, filesystem, delivery-roadmap, and operational plan into the Nirog documentation library.
- [ ] Create a private `nirog-backend` repository and bootstrap its workspace, packages, environment configuration, Docker, and development commands.
- [ ] Implement the foundation: Drizzle schemas and migrations, RBAC/PBAC-ready access interfaces, Zod validation, Scalar/OpenAPI, worker contracts, AI usage ledger, and test harnesses.
- [ ] Validate the local environment and publish both the documentation plan and backend foundation repositories.

The transactional core now supersedes the earlier FastAPI/SQLAlchemy implementation option: it will be Node.js/TypeScript with Fastify, TypeBox/JSON Schema validation, Drizzle and PostgreSQL. The existing modular-monolith, command ownership, RLS, persisted RBAC grant, PBAC evaluator, private-evidence, outbox, idempotency, and Flutter-authority rules remain unchanged. Python is not a second backend: it is a separately deployed ML/RAG worker process that receives bounded work references and returns through a narrow authenticated internal command boundary.

## Strapi platform evaluation

- [x] Inspect the official Strapi repository, supported architecture, plugin extension model, and engineering-guideline repository.
- [x] Compare a Strapi-centered platform, a custom Fastify/Drizzle core, and a bounded Strapi administration plane against Nirog’s clinical, RLS, RBAC/PBAC, worker, Scalar, and AI-ledger requirements.
- [x] Select and document the approved topology, including the exact role of Strapi, Drizzle, the internal API, and Python workers.
- [x] Revise the implementation inception plan and Storybook material to reflect the selected topology.
- [x] Create the new private `nirog-core` and `nirog-strapi-admin` repositories alongside the preserved legacy `nirog-backend` prototype, then bootstrap their approved environments.
- [x] Implement and validate the secure backend foundation; publication remains to be completed.

The upstream review confirms that Strapi’s official source is a Koa/Yarn/Nx CMS whose internal database package uses Knex and generated content-type tables. Its supported plugin mechanisms are useful, but the documentation cautions that extensions may break on upgrades. The Nirog implementation will reuse Strapi engineering principles and selectively use Strapi as a supported admin/cms plane; it will not replace upstream database internals with Drizzle inside a permanent core fork.

The approved topology is **bounded Strapi**, not a direct replacement of the clinical core and not a permanent modification of Strapi internals. `nirog-backend` will be the pnpm/Node 24/Fastify/TypeBox/Drizzle/PostgreSQL service that owns clinical records, RLS, patient RBAC/PBAC, Scalar/OpenAPI, outbox, usage ledger, Flutter contracts, and all user-visible actions. A separately deployed, pinned Strapi application will serve only workforce catalog-draft authoring, curated non-clinical knowledge, editorial templates, and an optional custom Nirog admin plugin. It will use separate storage and workforce OIDC; it will never expose patient data to Flutter, grant patient capability, or write the clinical database. Its reviewed release handoff is a signed internal command into the core, which creates immutable catalog releases. Python ML/RAG workers consume only versioned job envelopes and return evidence or retrieval results through restricted core commands.

The complete inception plan is now published under `docs/nirog/implementation-inception/` with five corresponding `08 Implementation Inception` Storybook pages. The native Storybook static build completed successfully after those pages were added.

The existing private `nirog-backend` repository is an independent FastAPI prototype with its own schema, direct JWT/RBAC model, custom administration console, and deployment history. It does not match the approved Drizzle/Core boundaries, so it will be preserved unchanged. The production-path foundation will instead use new private `nirog-core` and `nirog-strapi-admin` repositories, allowing a later deliberate migration or retirement decision without overwriting existing work.

`nirog-core` now contains the Node 24/pnpm workspace, Fastify/TypeBox API platform, Scalar/OpenAPI contract snapshot, Drizzle schema and reviewed foundation migration, PostgreSQL roles/RLS path, RBAC/PBAC evaluator interfaces, transactional platform tables, AI usage ledger tables, SQS adapter contract, isolated Python worker image, local Docker Compose topology, and passing format/lint/type/unit gates. `nirog-strapi-admin` is generated from released Strapi 5.52.0, bounded by explicit architecture/upstream rules, configured for a separate PostgreSQL local profile, and builds successfully. Docker daemon validation remains a local or CI task because this sandbox does not provide Docker.

The final Storybook build completed successfully. In the native preview, `08 Implementation Inception` is visible with Platform, Workspace, Persistence, Runtime, and Delivery Plan branches. The Bounded Strapi Decision and Backend Filesystem pages display their Mermaid topology/workspace diagrams, correct `nirog-core` naming, readable content, and source links without MDX rendering defects.

## Clerk-authenticated user subsystem

- [x] Reconcile the supplied User/AuthProvider/UserPreference/PatientProfile/Team/Invitation/ProfileAccess model with Nirog’s canonical profile-grant architecture and Clerk’s current server-verification guidance.
- [x] Define the identity, user-preference, profile, team, invitation, profile-access, permission, audit, event, and API contract decisions.
- [x] Add the reviewed Drizzle schema and forward migration, RLS policies, repository ports, Clerk verifier interface, and domain command handlers.
- [x] Implement the root Fastify Clerk authentication hook, protected Scalar/OpenAPI endpoints, account/preferences/profile/profile-grant routes, team creation, and persisted-grant capability enforcement.
- [x] Implement and run unit/API coverage for token parsing, fail-closed verifier configuration, active/revoked grants, anonymous rejection, idempotency, typed profile creation, and generated OpenAPI bearer security.
- [ ] Complete the intentionally deferred user-domain routes: team invitation create/accept, signed Clerk/Svix lifecycle webhook ingestion, device registration, and consent management.
- [ ] Add live PostgreSQL migration, security-definer/RLS, outbox atomicity, webhook replay, and Docker/CI integration coverage; then publish the user-slice completion updates.

`nirog-core` now has the `0001_clerk_user_subsystem` forward migration, Drizzle identity/platform records, account provenance, preferences, devices, patient profile, consent, profile access, teams, memberships, invitations, provider-event ledger, initial RLS policies, JIT account SQL function, role snapshot evaluator, Clerk verifier port, framework-independent user-domain commands, and Drizzle repository/event writer. Strict TypeScript passes after these additions.

The approved design is documented in `docs/nirog/implementation-inception/07-clerk-user-subsystem-design.md`. It fixes Clerk’s responsibility to verified authentication, JIT account mapping plus replay-safe lifecycle projection, local persisted-snapshot profile grants, team non-authority, PostgreSQL RLS context, the first public/scalar API surface, audit/outbox behavior, and the required migration/test order.

The user subsystem treats Clerk as the external authentication authority and Nirog Core as the local health-domain and authorization authority. Every bearer token is verified by Clerk’s supported backend/JWKS path with audience and authorized-party restrictions; client-decoded claims are never trusted. The first verified request can idempotently create the minimal local account projection, while verified webhook deliveries maintain display/lifecycle state but never serve as a synchronous authorization dependency. The supplied UML has been mapped into canonical accounts, identity provenance, preferences, patient profiles, teams, memberships, invitations, and the existing persisted-snapshot profile grants.

The first executable user slice is now verified in `nirog-core`: the global Clerk pre-handler protects the account, preference, profile, profile-grant, and team-creation routes; `ensure_clerk_account()` safely maps a verified Clerk `(issuer, subject)` to the local projection; all mutations require an idempotency key; and generated OpenAPI exposes bearer security with `/api/v1` declared as its server base. `pnpm verify` and the OpenAPI writer pass with 9 tests across 4 files. Team invitations, Svix-signed Clerk webhooks, device and consent routes, and live PostgreSQL/Docker integration tests remain explicit deferred work. The implementation record is available at `docs/nirog/implementation-inception/08-clerk-user-subsystem-implementation.md` and is exposed in the `08 Implementation Inception` Storybook navigation.

## Clean Architecture and development-artifact visibility

- [x] Audit the current Core feature boundaries and make the Clean Architecture dependency direction explicit in the filesystem and imports.
- [x] Confirm and document the live Scalar route, generated OpenAPI route, and the repeatable API-contract export command.
- [x] Confirm and document the Drizzle migration generation, review, application, and visibility workflow; distinguish generated migration files from hand-authored PostgreSQL RLS/security SQL where required.
- [x] Add Storybook navigation that exposes the actual Clean Architecture layout, API documentation URLs, and migration locations without requiring readers to infer them from source code.

The verified implementation now uses a feature-first Clean Architecture layout. `UserApplicationService` depends only on domain/policy ports; `DrizzleUserRequestScope` is the PostgreSQL/Drizzle infrastructure adapter; Fastify and TypeBox remain presentation adapters; and `composition/build-server.ts` is the only production wiring point. `GET /reference/` now serves the public Scalar HTML reference and is explicitly covered by the API test. `GET /openapi.json` remains the generated contract endpoint, while `pnpm openapi:write` writes the committed contract snapshot. Drizzle’s visible migration directory is `packages/db/drizzle/`; the schema source, generation command, migration runner, reviewed RLS/function SQL, and journal workflow are documented at `packages/db/README.md` and in the new `09 Clean Architecture and Development Artifacts` Storybook page. Backend `pnpm verify` passed with 9 tests, and the Node 22 Storybook build completed successfully.

## Feature-sliced HTTP platform hardening

- [x] Replace the coarse user application service with focused query and command use-case files, shared feature ports, and an explicit authorization helper.
- [x] Split user HTTP schemas, response mappers, route handlers, and route registration into feature-local modules rather than one aggregated route file.
- [x] Add reusable API problem/error primitives, a central exception mapper, correlation-aware error responses, and a consistent typed success envelope.
- [x] Add user-aware and anonymous-client rate limiting with bounded policy groups, standard rate-limit headers, safe public-route exemptions, and focused tests.
- [x] Split the API platform composition into dedicated OpenAPI, Scalar, error-handler, authentication, and rate-limit registration modules.
- [x] Expand OpenAPI/Scalar and Storybook documentation to show common response envelopes, problem responses, feature tags, and rate-limit behavior.

The user feature is now divided into command, query, authorization, error, port, contract, mapper, route, and registration modules. The platform now has common TypeBox success/problem schemas, response helpers, a central error/not-found mapper, `X-Correlation-Id`, global API route composition, public-route classification, generated `/openapi.json`, live Scalar `/reference/`, and feature tags. Successful business responses use `{ data, meta: { correlationId } }`; failures use `application/problem+json`. `@fastify/rate-limit` enforces limits after Clerk authentication using local account IDs; anonymous requests use client IPs. Valkey is part of Compose, a shared Redis-compatible rate-limit store is mandatory in production, and the environment template exposes the rate controls. Backend `pnpm verify` passed with 12 tests across 5 files; the Node 22 Storybook build completed successfully. Docker runtime validation remains pending because the sandbox has no Docker daemon.

The selected baseline is Python 3.13 with FastAPI and Pydantic v2; PostgreSQL 18 with SQLAlchemy 2, `asyncpg`, Alembic, and RLS; Celery 5.6 with managed Valkey transport and PostgreSQL-based outbox/consumer ledger; private S3/KMS evidence storage; OpenTelemetry and redacted structured telemetry; a validated OpenAPI-to-Flutter contract; Docker/OpenTofu/GitHub Actions; and an AWS ECS Fargate production profile. Storybook MDX/Mermaid remains the human architecture hub, while FastAPI OpenAPI plus Redocly becomes the executable API documentation and governance layer.

The stack must preserve a modular FastAPI/Python monolith with explicit application/domain/port/infrastructure layers, strict Pydantic transport models and immutable command types, PostgreSQL as the canonical authority with transaction-scoped RLS defense in depth, private object storage for evidence, a Redis-compatible broker/cache, separately scaled worker pools, OIDC/OAuth2 actor resolution, current profile capability evaluation, RBAC with a future policy evaluator seam, Flutter-safe OpenAPI/change-feed contracts, transactional outbox/idempotency, and redacted end-to-end observability.
