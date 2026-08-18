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

The selected baseline is Python 3.13 with FastAPI and Pydantic v2; PostgreSQL 18 with SQLAlchemy 2, `asyncpg`, Alembic, and RLS; Celery 5.6 with managed Valkey transport and PostgreSQL-based outbox/consumer ledger; private S3/KMS evidence storage; OpenTelemetry and redacted structured telemetry; a validated OpenAPI-to-Flutter contract; Docker/OpenTofu/GitHub Actions; and an AWS ECS Fargate production profile. Storybook MDX/Mermaid remains the human architecture hub, while FastAPI OpenAPI plus Redocly becomes the executable API documentation and governance layer.

The stack must preserve a modular FastAPI/Python monolith with explicit application/domain/port/infrastructure layers, strict Pydantic transport models and immutable command types, PostgreSQL as the canonical authority with transaction-scoped RLS defense in depth, private object storage for evidence, a Redis-compatible broker/cache, separately scaled worker pools, OIDC/OAuth2 actor resolution, current profile capability evaluation, RBAC with a future policy evaluator seam, Flutter-safe OpenAPI/change-feed contracts, transactional outbox/idempotency, and redacted end-to-end observability.
