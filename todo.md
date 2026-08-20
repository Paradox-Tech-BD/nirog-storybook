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

`nirog-core` now contains the Node 24/pnpm workspace, Fastify/TypeBox API platform, Scalar/OpenAPI contract snapshot, Drizzle schema and reviewed migrations, PostgreSQL roles/RLS path, RBAC/PBAC evaluator interfaces, transactional platform tables, AI usage ledger tables, a PostgreSQL outbox-dispatcher foundation, Cloudflare R2 evidence adapter, isolated Python worker image, local Docker Compose topology, and passing format/lint/type/unit gates. `nirog-strapi-admin` is dormant. Docker daemon validation remains a local or CI task because this sandbox does not provide Docker.

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

## Temporary sandbox API exposure

- [x] Start the verified Core API with sandbox-safe local settings, expose its temporary public URL, and verify `/health/live`, `/api/v1/health/live`, `/reference/`, and `/openapi.json` from that URL.

The temporary sandbox API runs with no Clerk credentials and no live PostgreSQL/Valkey service. Public health, OpenAPI, and Scalar routes are available for review; protected business endpoints intentionally return authentication-unavailable responses rather than accepting an unverified token. During live reference verification, API-prefixed health aliases were added so Scalar’s `/api/v1` server declaration sends requests to a real documented health route while root health probes remain available and hidden from the public API contract.

## Credential-enabled sandbox verification

- [ ] Restart the temporary API using user-supplied Clerk credentials held only in the active sandbox process, then verify a real Clerk bearer token against a protected user endpoint without persisting secrets.

## Nirog Next.js web companion

- [x] Create a separate private Next.js repository with a responsive, phone-complementary Nirog user interface.
- [x] Implement Clerk browser authentication, a protected Core API client, and Clerk-session bearer propagation without exposing Core credentials to the browser.
- [x] Build the initial authenticated dashboard/profile experience around the implemented Core user APIs; document local environment and deployment configuration without storing private Clerk credentials.

The private `Paradox-Tech-BD/nirog-web` repository now contains the Next.js 16 App Router web companion. The signed-out Clinical Ledger landing view and signed-in care workspace use Clerk Core 3 provider/proxy boundaries; a same-origin `GET /api/core/me` handler obtains the Clerk token server-side and forwards it to Nirog Core. The first dashboard presents actual Core projection state or a typed connection problem—it never fabricates medication or clinical records. The repository includes an untracked `.env.local` template, a public-key-only browser setting, server-only Clerk configuration, `NIROG_CORE_API_URL`, optional Core JWT-template configuration, a deliberate responsive design direction, and browser preview evidence. `pnpm lint` and the Next.js production build passed before commit `3b471a3` was published to the private repository.

## Cloudflare R2 evidence storage

- [x] Replace the evidence-object storage configuration model with Cloudflare R2’s S3-compatible endpoint, bucket, credential, and region settings.
- [x] Replace the obsolete local queue emulator with PostgreSQL transactional outbox controls; do not conflate asynchronous delivery with R2 evidence storage.
- [x] Document secure local and production R2 configuration, key scoping, presigned upload constraints, and the Flutter/Next.js upload boundary.
- [x] Verify configuration validation and publish the Core and Storybook updates.

The backend separates `OUTBOX_*` PostgreSQL worker controls from `EVIDENCE_R2_*` evidence-object configuration. A new `@nirog/evidence-storage` package provides the Cloudflare R2 S3-compatible adapter with normalized-key, content-type, and presigned-URL expiry guards. Production requires `EVIDENCE_STORAGE_DRIVER=r2`, an HTTPS R2 endpoint, `auto` region, a bucket, and bucket-scoped credentials; local Compose defaults evidence storage to disabled. Live R2 credential, bucket CORS, and real-upload verification remain an environment integration step requiring user-supplied R2 values.

## AWS-free Railway asynchronous processing

- [x] Remove AWS SQS configuration, queue bootstrap, queue adapter dependencies, and AWS-specific deployment guidance from Nirog Core and Storybook.
- [x] Implement the Railway-compatible PostgreSQL transactional-outbox dispatcher configuration and polling/retry controls, using the existing platform outbox records as the durable queue.
- [x] Document API plus Railway worker deployment, PostgreSQL concurrency claims, retry/dead-letter state, and Cloudflare R2 evidence storage without any AWS account or credential requirement.
- [x] Verify the AWS-free configuration and publish corrected Core and Storybook updates.

The required deployment baseline is now Railway Core API + Railway dispatcher + PostgreSQL + managed Valkey/Redis + Clerk + Cloudflare R2. `@nirog/queue`, LocalStack, AWS credentials, SQS URLs, and SQS deployment guidance are removed. The dispatcher contains a feature-sliced PostgreSQL outbox store and processor: it claims only handler-registered event types through `FOR UPDATE SKIP LOCKED`, applies leases, sets `published_at` after success, schedules bounded retries after transient errors, and marks terminal failures with `dead_lettered_at` and a safe failure code. Migration `0002_postgres_outbox_dispatcher.sql` adds retry/dead-letter fields and an eligible-event index. `NIROG_RUNTIME_ROLE` makes Clerk, R2, and shared API rate-limit validation mandatory for the API role but not for the dispatcher or migrator role; the worker therefore starts with PostgreSQL and outbox settings only. Backend `pnpm verify` passed with 22 tests across 7 files, OpenAPI regenerated successfully, and the Node 22 Storybook build passed. Live PostgreSQL/Railway concurrency validation remains a deployment-environment integration step because Docker is unavailable in this sandbox.

## Secret-safe Railway deployment review

- [x] Review the Railway, Neon, Cloudflare R2, Redis, and Clerk variable shapes without retaining copied credentials.
- [x] Correct documentation for R2 S3 API endpoint versus custom public domain use and add a credential-rotation/deployment-secret rule.
- [x] Provide a redacted Railway variable checklist and immediate rotation steps for credentials exposed outside sealed secret storage.

The deployment review identified that an R2 custom/public domain cannot serve as `EVIDENCE_R2_ENDPOINT` for the R2 S3 adapter or presigned uploads. The configuration guard now requires the HTTPS account-specific `*.r2.cloudflarestorage.com` endpoint, and focused tests cover the rejection. A Neon pooled URL is appropriate for the persistent Railway API and dispatcher processes; use a direct Neon URL for schema migration where available. Railway Redis is available internally through its service-provided `REDIS_URL`; Cloudflare R2, Neon, Railway Redis, and Clerk secrets must be rotated after any exposure outside sealed secret storage and are never retained in Nirog source, documentation, or application configuration files.

## Clerk web-to-Core bearer propagation

- [x] Trace the authenticated Nirog Web Core bridge, Clerk session-token template selection, and Nirog Core verifier expectations behind the reported `401 UNAUTHENTICATED` response.
- [x] Correct the token-template/audience/authorization-header boundary: request the normal session-bound token, and configure the Nirog audience as a Clerk session-token claim rather than a custom JWT template.
- [ ] Verify the fixed authenticated request path and publish the Core, Web, and documentation update if required.
- [ ] Diagnose the renewed live `401 UNAUTHENTICATED` after the Clerk session audience claim was added, using only safe correlation/claim-presence diagnostics to isolate audience, authorized-party, issuer/key, or deployment-version mismatch.
- [ ] Restore the Railway API service from the reported startup loop by replacing the invalid R2 custom-domain endpoint with the Cloudflare account S3 endpoint, then collect the safe Clerk verifier diagnostic from a live request.

The supplied Railway logs confirm that the API process stops during configuration loading and never reaches the Clerk verifier. The replacement endpoint supplied for the Railway API service is `https://31bdd67db1cb4ef613270147c715fdee.r2.cloudflarestorage.com`; the Railway dashboard was opened for the configuration update, but its service controls had not rendered in the sandbox view at inspection time.

After browser sign-in, the Railway workspace shows project `zealous-success` with one of four services crashed. The project route is open and the API service must be identified from its service controls before saving the approved R2 endpoint replacement.

The Railway service view now shows `@nirog/api` online at `nirog.up.railway.app` and `@nirog/dispatcher` online. The crashed workload is `@nirog/migrator`, so the original R2 startup log must be associated with that separate service or an earlier API deployment; the migrator’s actual variables and deploy command must be inspected before changing a healthy API service.

The migrator service currently has only `DATABASE_URL`, `POSTGRES_URL`, `NIROG_APP_ENV`, and `NIROG_RUNTIME_ROLE` as explicit variables. This is the correct minimal secret boundary for a migration role; the values remain masked. The remaining investigation is therefore limited to whether `NIROG_RUNTIME_ROLE` is set to `migrator` and whether the service uses the migration command rather than the API start command.

The migrator settings confirm its custom start command is already `pnpm --filter @nirog/migrator start`, matching the repository’s one-shot Drizzle migrator package. The approved corrective edit is restricted to its `NIROG_RUNTIME_ROLE` service variable; the variable’s existing masked value is not revealed or retained.

The approved variable inspection confirms `NIROG_RUNTIME_ROLE=migrator` is already set. No variable was changed or saved. The migrator’s reported `Crashed` state must therefore be diagnosed from its current deployment logs and one-shot process lifecycle rather than altered role or R2 configuration.

The current Railway migrator deployment is marked `Crashed` for commit `5318354`, despite its correct one-shot start command and runtime role. The deployment-card interaction did not expose its log body, so the next safe inspection target is the service Console view.

The Railway migrator console identifies the true database failure: the initial foundation migration reaches its permission grants, then Neon returns PostgreSQL error `42704` because local role `nirog_api` does not exist. The role and command configuration are correct; the foundation migration must conditionally create role-targeted grants/policies only when those optional local roles exist, while retaining the schema and RLS foundation for the Neon owner connection.

Core commit `c222be8` contains the verified Neon-compatible migration repair, but Railway skipped the migrator deployment because its watch path is limited to `/apps/migrator/**` and does not include the shared `/packages/db/drizzle/**` directory. The migrator must be explicitly redeployed now, and its watch paths should include both the migrator application and the shared migration directory so future schema changes trigger the job.

The Railway deployment history confirms `c222be8` was skipped exclusively for the configured watch-path rule; it was not rejected by build or migration validation. The confirmed migrator settings route is now open for the approved watch-path correction and subsequent redeploy.

During the approved settings update, the Railway page briefly reset to a blank view and then reloaded the confirmed migrator settings route. No deployment or variable change occurred during the reset; the watch-path update remains pending.

The approved watch-path addition is now staged as the sole Railway change: `/packages/db/drizzle/**`, alongside the existing `/apps/migrator/**`. Railway displays one pending configuration change and an explicit Deploy action; no secrets, variables, or other service settings were modified.

The approved configuration change has been applied. Railway now lists both watch paths and has started a fresh migrator build, which will run Core commit `c222be8` and the Neon-compatible foundation migration.

The new Railway migrator deployment has completed its build and entered the deploy stage. Both required watch paths remain configured; final migration output is pending.

Railway now reports all four services—API, dispatcher, Redis, and migrator—as online. A browser navigation to the public API liveness route rendered as an empty page and then reset the browser view; an independent protocol-level request returned HTTP `200` from `https://nirog.up.railway.app/api/v1/health/live`.

- [x] Repair the Neon-incompatible foundation migration and configure Railway to redeploy the migrator when shared Drizzle migration files change.
- [ ] Retest one authenticated Nirog Web request now that the database migration and all Railway services are healthy; use the safe Clerk verifier diagnostic only if the response remains `401`.
- [ ] Capture the new Railway migrator failure after its brief healthy state and determine whether it is a one-shot process lifecycle issue or a new migration error.
- [ ] Capture the safe Core `authDiagnostic` category for the still-failing signed-in Web request, then correct only the remaining Clerk claim, origin, issuer, or deployment mismatch.

The Railway migrator console has been reopened for the renewed failure, but its terminal stream is still loading. No production configuration was changed during this inspection.

The console confirms there are no running migrator instances, and deployment history identifies the renewed crash as the fresh `c222be8` deployment (`51a7bfd2-a203-4fff-9e04-7dada30b8bde`). Its deploy-log output is the next evidence source.

Direct navigation to the exact Railway deployment log route temporarily reset the sandbox browser to an empty page. No configuration or deployment state changed; the fresh deployment log remains the required diagnostic source.

The Railway project page was reopened after the browser reset and is still rendering its service canvas. No service configuration, deployment, or variable was altered during this recovery step.

The fresh migrator deployment log panel now shows it executed migration SQL before `@nirog/migrator` exited with status `1`. Its visible terminal footer contains `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL` for `tsx src/main.ts`; the exact underlying PostgreSQL diagnostic was not present in the initially loaded log slice and is being extracted without reading any secret values.

The role-dependent statement was identified in `0001_clerk_user_subsystem.sql`: the Clerk user-subsystem migration still created policies and grants `TO nirog_api` without checking whether that local role exists. Core commit `8c8caaa` now keeps RLS enabled but conditionally applies those optional local-role grants and policies. Lint, type-checking, and all 26 tests pass; the commit is pushed to `main` and should trigger the migrator through `/packages/db/drizzle/**`.

Railway marked the new `8c8caaa` migrator deployment as requiring external-contributor approval. The user approved deployment; the visible control was invoked after the first click did not advance the page state. The next check is whether Railway transitions the pending job into build/deploy execution.

Railway accepted the approved deployment and the new guarded-migration job is now building. The API and dispatcher remain online while the migrator build proceeds; no additional configuration has been changed.

The approved `8c8caaa` migrator deployment completed successfully. Railway now reports the migrator, API, dispatcher, and Redis services as online; the prior failing migrator deployment has been removed. The remaining active issue is the separate signed-in Web-to-Core authentication failure.

The API service is confirmed online on the safe Clerk diagnostic deployment (`chore: log safe Clerk verification diagnostics`). Its Railway console session is available, while the migrator is now shown as completed rather than crashed. The next evidence source is the API log explorer filtered for the current Web authentication failure.

Railway’s API log explorer confirms the migrator’s new run completed (`Nirog Core migrations completed`). It also captures the current Web-to-Core rejection as `authFailure=invalid_token` and `authDiagnostic=clerk.unexpected-verification-failure` for `GET /me`. The Core route and bearer-header boundary are being reached; the remaining issue is the deployed Clerk verification/key/claim configuration.

The live API variable inventory confirms `CLERK_JWT_KEY`, `CLERK_AUDIENCE`, and `CLERK_AUTHORIZED_PARTIES` are present, but `CLERK_SECRET_KEY` is absent. The Core is therefore using only the multiline static public-key verifier; switching to Clerk’s server-side secret-key/JWKS verification is the remaining recommended production repair. Variable values were not viewed or retained.

Core commit `b2ae478` now prefers `CLERK_SECRET_KEY` for Clerk’s JWKS verification whenever it is configured, falling back to `CLERK_JWT_KEY` only when no secret key exists. The focused regression test passes as part of the 27-test Core suite. The remaining live action is to add the current Clerk **backend secret key** in Railway under `CLERK_SECRET_KEY` and redeploy the API; the existing static public key may remain temporarily because the corrected verifier will no longer select it when a secret key is present.

Railway has accepted the `b2ae478` API deployment and is building it. The prior API deployment remains healthy during the transition; final validation requires the completed build and the presence of the user-entered `CLERK_SECRET_KEY` variable.

The `b2ae478` API deployment is now active and the signed-in Clerk Web session was reproduced at `https://www.nirog.me`. A direct same-origin bridge request to `GET /api/core/me` still returns the generic `401 UNAUTHENTICATED` problem with correlation ID `e856b8af-79d8-4e2d-b790-6431ac352e5e`; no token content was accessed. The next step is to retrieve only the matching Core log diagnostic.

The matching Railway log retains `authDiagnostic=clerk.unexpected-verification-failure`. The request reaches the new API process, but the rejection does not yet distinguish an explicit audience or authorized-party mismatch; the immediate check is whether the newly added `CLERK_SECRET_KEY` was injected into a deployment that started after it was saved.

The initial post-save Railway variable check temporarily reset the sandbox browser to an empty page before the variable inventory rendered. No service setting or secret was read; the secret-key presence check remains pending through a stable Railway project route.

The Railway project route has recovered and confirms the migrator is completed while the API, dispatcher, and Redis services are online. No configuration was changed during the browser recovery; the API secret-key presence and runtime-injection check remains in progress.

The stable API variable inventory now confirms `CLERK_SECRET_KEY` is present alongside `CLERK_JWT_KEY`, `CLERK_AUDIENCE`, and `CLERK_AUTHORIZED_PARTIES`; all values remain masked. Since Core commit `b2ae478` is active and prefers the secret-key/JWKS path, the remaining failure is narrowed to a Clerk key/instance alignment issue or the live session token’s non-sensitive issuer/audience/authorized-party claims.

Core commit `17eb7ef` expands the safe Clerk diagnostic map to explicitly classify invalid server keys, remote JWKS resolution, and issued-in-the-future conditions. It is pushed to `main` with all lint, type, and 28-test checks passing. Railway must deploy this API-only diagnostic change before the next signed-in bridge request reveals the remaining key or claim mismatch.

Railway shows the `17eb7ef` API deployment as pending external-contributor approval. The currently active API deployment remains `b2ae478`, which already prefers the now-present `CLERK_SECRET_KEY`; approval is required only to activate the additional safe diagnostic categories for the next live test.

The user approved the `17eb7ef` API deployment. Railway accepted it and entered the build phase while `b2ae478` remains active; the expanded diagnostic cannot yet be used until the build completes.

Railway has now activated the approved `17eb7ef` API deployment (`318c328b-352f-452c-897e-a0c3301e0040`). The safe expanded Clerk diagnostic is live and ready for a reproduction using the already signed-in Nirog Web session.

The signed-in Nirog Web app was reopened for the post-deployment test. Browser-console `fetch` execution did not retain the page origin, so the same read-only bridge request will be reproduced through the rendered `Refresh record` control instead; no token, secret, or deployment setting was accessed or changed.

The sandbox browser subsystem entered a temporary crash-loop cooldown before the rendered refresh control could be invoked. Railway deployment `17eb7ef` remains active with the expanded safe Clerk diagnostic; a user-initiated refresh from the signed-in frontend will produce the final non-sensitive correlation and diagnostic needed for resolution.

After browser recovery, the preserved signed-in session autonomously refreshed the Nirog Web record against active Core deployment `17eb7ef`. The Web app still returned its generic authentication card, while the signed-in display identity remained present. The final action is to read the just-written Railway API diagnostic, which now includes explicit invalid-key and JWKS categories.

The final root cause is in Core’s Clerk SDK integration, not the active session, Railway secret, or audience claim: the public `@clerk/backend` `verifyToken()` adapter returns decoded claims directly on success and throws on verification failure. Core incorrectly treated the success result as an internal `{ data, errors }` envelope, so `!verified.data` was always true and every successful Clerk session was rejected as `UNAUTHENTICATED`. The next patch will consume direct claims and add a regression test for the public SDK return shape.

Core commit `a1071a8` fixes the return-shape defect by consuming the public Clerk verifier’s direct decoded-claims object and preserving thrown verification errors for the existing safe diagnostic path. The correction is pushed to `main`; lint, type checking, and all 29 tests pass. Railway deployment approval is the remaining step before the preserved signed-in Web session can succeed.

After the approved `a1071a8` deployment became active, the preserved signed-in Web session advanced past the prior `UNAUTHENTICATED` failure and now receives `Route not found`. This confirms Clerk authentication is functioning; the remaining issue is a Web-to-Core route-base mismatch, with the bridge reaching Core’s authenticated path but requesting a route that the deployed API does not serve. The Web bridge URL construction and Core route registration must be aligned next.

Nirog Web commit `3ac4be0` normalizes `NIROG_CORE_API_URL` to the required Core `/api/v1` root whether Railway/Vercel supplies a bare public origin or an already versioned base. Production lint and build pass. The commit is pushed to `main`; after its automatic web deployment becomes active, the preserved signed-in session should load `GET /api/core/me` successfully instead of returning `Route not found`.

The published Web route correction is live: the signed-in dashboard progresses past both `UNAUTHENTICATED` and `Route not found`, then receives `Internal server error` from Core. This proves the request now reaches the authenticated account path; the remaining defect is in Core’s JIT account provisioning or account-projection persistence and must be identified from the current Railway API error log.

Railway identifies the authenticated `GET /api/v1/me` failure as `TypeError: Cannot read properties of undefined (reading 'parsers')` in Drizzle’s postgres.js driver, called by `createScopedDatabase()` during `DrizzleUserRequestScope.run`. The transaction-scoped persistence layer is incorrectly constructing a new Drizzle client around a postgres.js transaction object; the fix must use the existing transaction-aware Drizzle context instead of treating it as a raw postgres client.

The current implementation baseline is Node 24 with TypeScript, Fastify, TypeBox, Drizzle, and PostgreSQL RLS; a PostgreSQL transactional outbox with a separate Railway dispatcher; Cloudflare R2 private evidence storage; managed Valkey/Redis for shared rate limits; Clerk authentication; Scalar/OpenAPI contracts; Docker Compose for local development; and Railway services for deployment. Storybook MDX/Mermaid remains the human architecture hub, while Fastify-generated OpenAPI plus Scalar is the executable API documentation layer.

The Core persistence scope is corrected locally: `withRequestContext()` now opens a native Drizzle transaction, applies the RLS settings with `transaction.execute(sql\`select set_config(...)\`)`, and passes that same transaction directly to `DrizzleUserRepository` and `DrizzleUserEventWriter`. This removes the invalid `createScopedDatabase()` re-wrap. A regression test proves the native transaction is preserved and receives all four RLS settings. `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass with 30 tests across 9 files; the change is ready to commit and deploy.

Core commit `098b762` (`fix(db): use native Drizzle request transactions`) was approved and is active on the Railway API service. The preserved signed-in Nirog Web session now completes `GET /api/core/me` successfully: the dashboard renders **Verified profile record**, `UTC` preferences with notifications enabled, a server correlation identifier, and the expected empty-profile state rather than an authentication, route, or internal-server error. The full Clerk bearer propagation, session audience, Core verifier, route-base, migration, and transaction-scope incident is resolved end to end.

The current-state and access-setup handoff is now documented as `implementation-inception/13-current-project-state-and-access-setup.md` and exposed in Storybook. It separates profile roles, collaboration-team roles, platform operations roles, and workforce/editorial roles; confirms that Core does not yet implement a `platform_admin` feature; and defines the safe next implementation order before medicine/OCR delivery. The Clerk implementation record and Storybook page now reference the native Drizzle transaction correction and the current 30-test verification baseline.

The approved incremental execution plan begins with a production baseline freeze: preserve the authenticated account-path commits and verification evidence, then add live PostgreSQL/RLS integration coverage before expanding any identity or clinical product feature. Subsequent increments are Clerk webhook ingestion, directed team invitations, consent/device lifecycle, dedicated platform administration, manual medication management, bounded prescription/OCR processing, and finally reminders/adherence/refill workflows. Each increment has its own completion gate and must remain separate from patient-data authority decisions.

Baseline gate complete: at Core commit `098b762`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm openapi:write` all completed successfully. The suite remains at 30 passing tests across 9 files, and the generated OpenAPI contract was refreshed from the current route source. No product schema, endpoint, permission, or runtime configuration was changed by this gate.

The next small increment is live PostgreSQL/RLS integration verification. Its bounded outcome is a disposable database harness and CI job that can apply the existing migrations and prove account projection, owner/grantee isolation, request-scoped RLS, and transactional audit/outbox behavior without using production credentials or expanding the product API.

The first disposable PostgreSQL CI run exposed a real RLS defect: querying `identity.patient_profiles` as the `nirog_api` grantee causes PostgreSQL error `42P17` (`infinite recursion detected in policy for relation "patient_profiles"`). The profile policy checks `profile_access`, whose policy checks `patient_profiles`, creating a circular policy graph. The planned correction is to replace that cross-table policy recursion with a tightly scoped security-definer capability predicate, then rerun the disposable integration suite before any new product-domain work.

The PostgreSQL/RLS increment is now verified by GitHub Actions against a disposable `pgvector/pgvector:pg16` service. It introduced real migration/RLS tests, a reusable manual CI trigger, and forward migration `0003_profile_rls_capability_predicate.sql`; the live test exposed and the migration removed the prior owner/grantee policy recursion. The next bounded increment is Clerk lifecycle webhook ingestion. Clerk’s current official guidance confirms that it is event-driven and eventually consistent, requires a public endpoint with raw-body Svix signature verification, and supports retry/replay; Core will therefore deduplicate by provider delivery ID and must not make sign-in or immediate patient access depend on webhook arrival.

The Clerk webhook receiving boundary is implemented locally at `POST /api/v1/integrations/clerk/webhooks`. It is public only to accept Svix-signed Clerk deliveries: Fastify preserves the raw JSON bytes, the official Clerk Backend verifier validates the signature, unsupported event types are acknowledged without persistence, and supported `user.created`, `user.updated`, and `user.deleted` deliveries are recorded exactly once by provider delivery ID with an audit row and a bounded outbox event. Tests cover the public-route exemption, invalid/missing signature behavior, missing signing-secret fail-closed behavior, duplicate-safe service outcome, and real raw-body signature acceptance/rejection. The remaining operational step after deployment is to set `CLERK_WEBHOOK_SIGNING_SECRET` in Railway and configure `https://nirog.up.railway.app/api/v1/integrations/clerk/webhooks` in the Clerk Dashboard for those three user event types; lifecycle consumers remain a separate dispatcher increment.

Core commit `43e6ec9` (`feat(integrations): receive verified Clerk webhooks`) was approved and deployed successfully to Railway. It includes the forward-only profile RLS recursion repair and the signed Clerk webhook receiving route. Railway shows the API service online with that revision active, and a non-mutating `GET /api/v1/health/live` probe returned HTTP `200` with a fresh Core correlation ID. The endpoint remains intentionally fail-closed with `503 WEBHOOK_UNAVAILABLE` until the Clerk webhook signing secret is configured in the Railway API environment.

Execution preference: continue routine implementation, test, documentation, and deployment work autonomously through the sandbox browser and existing project sessions; do not attempt to connect the user’s personal browser. Keep prompts limited to genuinely unavailable credentials, mandatory security gates, or an action that cannot be safely inferred.

- [x] Activate Clerk webhook delivery in the sandbox-accessible Clerk environment by creating or selecting the production endpoint, setting the issued signing secret in Railway’s API environment, selecting only `user.created`, `user.updated`, and `user.deleted`, and confirming one signed test delivery.
  - Target project: **Nirog** in the currently signed-in Clerk Dashboard account.

Clerk activation progress: the Nirog **Development** instance now has a webhook endpoint targeting `https://nirog.up.railway.app/api/v1/integrations/clerk/webhooks`, described as the Core signed lifecycle receiver, with exactly `user.created`, `user.updated`, and `user.deleted` subscribed. The endpoint-issued signing secret was stored only as `CLERK_WEBHOOK_SIGNING_SECRET` in Railway’s protected `@nirog/api` production service variables; applying the variable triggered the normal API redeployment. The remaining acceptance check is one successful signed test delivery recorded by Clerk and acknowledged by Core.

Acceptance trigger sent: a disposable Nirog Development user labeled **Webhook Acceptance** was created with the non-personal test identifier `webhook.acceptance.20260820@example.com`. This should emit the subscribed signed `user.created` delivery; the next check is the Clerk delivery result and Core log/audit acknowledgement. Its development-only password is not retained in source, documentation, or task records.

Webhook activation verified: Railway recorded the Clerk-originated `POST /api/v1/integrations/clerk/webhooks` at `08:40:47 UTC` with Core request ID `c0d4e69e-2752-430a-89af-3933c7a1980b`; the active API returned HTTP `202` after `2053 ms`. This proves the Nirog Development endpoint, protected signing secret, raw-body signature verification, and asynchronous provider-event acknowledgement operate end to end. The disposable test user remains a clearly labeled Development-only fixture; no patient profile, grant, or clinical record was created.

The next bounded increment is directed team invitations. It will expose safe create, accept, decline, cancel, expiry, and idempotency behavior over the existing invitation model, with only team-owner/team-admin authority to manage membership and no implicit patient-data capability for invitees or team members.

The directed invitation slice now compiles and passes the Core static quality gate. It adds direct-account invitation create/accept/decline/cancel routes; a seven-day default and 30-day maximum expiry; owner/admin invitation authorization with administrators restricted to inviting `member` roles; recipient-only accept/decline; auditable lifecycle events; and forward migration `0004_team_invitation_lifecycle.sql` for the corresponding PostgreSQL RLS policies. `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm openapi:write` pass locally with 36 passing tests across 12 files (3 database-dependent tests skipped locally). The remaining gate is CI execution against its disposable PostgreSQL service before the migration and endpoints are deployed.

The first disposable PostgreSQL invitation CI run correctly failed closed with PostgreSQL `42P17` (`infinite recursion detected in policy for relation "team_members"`). The new invitation policy’s membership lookup reached an existing circular policy dependency between `identity.teams` and `identity.team_members`. The repair is a forward migration that replaces all team visibility, member-mutation, and invitation-manager cross-table policy queries with narrowly scoped `SECURITY DEFINER` owner/member/manager predicates, grants them only to `nirog_api`, and reruns the same live database test before deployment.

The directed invitation release is now verified and active. Core commits `99a20b1` and `90f60e5` passed the GitHub Actions unit and disposable PostgreSQL jobs; the latter applies migrations through `0005_team_rls_capability_predicates.sql` and confirms owner/admin restrictions, direct-recipient acceptance, and no patient-profile visibility through team membership. Railway deployed the invitation revision successfully, with its migrations and API container now online. No patient profile, access grant, or clinical evidence was created by the deployment verification.

The next bounded increment is consent and device lifecycle. It will expose explicit consent capture/revocation and self-service device registration/revocation over existing identity tables, keep push-token material out of audit/outbox payloads and responses, enforce profile-owner or subject authority for consent actions, and add no new clinical read/write capability.

- [x] Implement and verify the consent/device lifecycle slice with typed Core routes, RLS policies, audit/outbox evidence, disposable PostgreSQL assertions, generated Scalar/OpenAPI documentation.

The next bounded increment is dedicated platform administration. It will introduce a local, auditable platform-role assignment model with explicit bootstrap and revocation controls. A platform role must not confer profile, evidence, medication, prescription, or other clinical access; exceptional access remains a separate future policy decision.

- [x] Draft the platform-role API endpoints, authorization matrix, and explicit zero-patient-data security rules for review and generated Scalar/OpenAPI documentation.
- [x] Implement and verify the platform-administration slice with separate role assignments, a bootstrap procedure, typed Core routes, audit/outbox evidence, disposable PostgreSQL assertions, and generated Scalar/OpenAPI documentation.

The next bounded product increment is manual medication management: an explicitly profile-authorized catalog selection, prescription/regimen, dose schedule, and dose-log vertical slice. It must preserve profile-grant authority, consent/device/platform-role separation, idempotency, audit/outbox evidence, and no OCR evidence processing until the later dedicated workflow increment.

- [ ] Implement and verify the manual medication vertical slice with typed Core routes, profile-scoped RLS, audit/outbox evidence, disposable PostgreSQL assertions, and generated Scalar/OpenAPI documentation.

The stack must preserve a modular FastAPI/Python monolith with explicit application/domain/port/infrastructure layers, strict Pydantic transport models and immutable command types, PostgreSQL as the canonical authority with transaction-scoped RLS defense in depth, private object storage for evidence, a Redis-compatible broker/cache, separately scaled worker pools, OIDC/OAuth2 actor resolution, current profile capability evaluation, RBAC with a future policy evaluator seam, Flutter-safe OpenAPI/change-feed contracts, transactional outbox/idempotency, and redacted end-to-end observability.
