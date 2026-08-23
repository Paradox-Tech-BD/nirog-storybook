# Nirog Software and Access Architecture

## Continuation reconciliation

- [x] Reconcile the referenced Schema Development Continuation work with current Core, web companion, Storybook, and production health state before selecting another backend increment.
- [x] Restore authenticated Core synchronization, fast-forward from `105eb6f` to the continuation history, and compare the local `0014_adherence_timezone_metric_key` draft with the published migration before removing the duplicate local files.
- [x] Publish the profile-authorized reminder occurrence timeline as Core commit `63c8c6b`, including generated OpenAPI, bounded read validation, and API coverage.

> **Reconciliation record — 22 August 2026:** upstream Core already contains the timezone-aware adherence uniqueness repair as `0014_adherence_timezone_metric_key`; its correct PostgreSQL operation drops the original unique **index**, rather than a table constraint. The continuation also includes persisted adherence calculation and reporting, reminder due intent dispatch plus snooze/acknowledgement, inventory movement history and refill-alert acknowledgement, manual medication normalization, OCR provenance, and read-only receipt audit. The older local migration draft was preserved outside the repository and removed only after its semantic difference was confirmed. Core is clean and synchronized at `63c8c6b`. The Railway public health route returned HTTP 200 after the push; the Railway project canvas had not yet rendered a revision label, so publication records the API release as pushed and health-checked rather than claiming a revision-specific deployment confirmation.

## Real prescription evidence acceptance

- [x] Run the supplied prescription image through the authenticated production frontend and verify the complete evidence upload, secure storage, isolated OCR, and persisted review-only status path without automatic medication mutation.
- [x] Repair and deploy the verified missing profile-onboarding and evidence-status refresh boundaries; document the final acceptance evidence on both Storybook publication branches.

> **Real-evidence acceptance record — 22 August 2026:** an authenticated account initially had no patient profile, so the web companion correctly blocked upload. The companion now creates a profile through its server-side Clerk-to-Core bridge using Core’s required idempotency header, without exposing a bearer token to the browser. An authorized profile and an empty prescription container were created, then the supplied JPEG was accepted as a supported 175 KB image and submitted through the secure review upload flow. The authenticated Core bridge confirmed one `processed` evidence record and one `pending_review` extraction after isolated OCR. The deployed browser subsequently rendered both states after the full sequential Core-read interval. No medication, regimen, reminder, inventory, or clinical confirmation endpoint was called. Web commits `c359a1f`, `54cb347`, and `27cc7ed` add profile onboarding, status refresh, and reliable post-refresh loading; lint, unit tests, and clean production builds passed.

## Web companion reconstruction

- [x] Trace the authenticated Web-to-Core read path for profiles, caregiver-visible membership data, prescriptions, evidence, extraction metadata, medication drafts, and OCR receipts; identify why expected uploaded-prescription state is absent or unreliable in the frontend.
- [x] Rebuild the Web companion information architecture and visual system around Core-authoritative clinical states, including clear loading, empty, processing, retryable-failure, terminal-failure, and draft-ready presentations.
- [x] Implement tested, permission-aware caregiver views that expose only authorized profile, invitation, membership, provenance, and draft-state information; preserve the rule that caregivers do not gate extraction and lack regimen-write by default.
- [x] Repair or add route-policy, proxy, data-loading, and component tests for the rebuilt read flows, then visually verify patient and caregiver states without creating a new regimen or exposing clinical payloads.
- [x] Publish the verified Web companion recovery increment and update the corresponding Storybook Web and subsystem references on both documentation branches.

> **Web reconstruction verification — 22 August 2026:** production read metadata showed that account, profile, prescription, evidence, extraction, and draft requests were succeeding while the original evidence workspace recreated its loader after updating selected identifiers. The replacement uses a stable bootstrap and explicit refresh model, independent partial reads, and an editorial care-pathway interface. It renders the existing profile and prescription response rather than looping indefinitely, and it makes received, processing, terminal, and draft-ready states legible without treating UI state as clinical truth. The published care-circle route renders only the current actor’s owner-or-grant access context; Core now includes active unexpired delegated profiles in an account projection and exposes that self-only context under `profile.read`, while full grant rosters remain `share.manage`-protected. The focused Core suite passed 16 tests with typechecking; the Web suite passed 9 tests, lint, and a standard production build. Production browser checks completed without uploading a file, changing access, creating a draft, or submitting a regimen. The existing evidence currently shows a terminal rejected state with no extraction or medication draft, so this increment verifies frontend visibility and access boundaries—not successful provider extraction.

## Automated prescription ingestion and medication drafts

## Authorized prescription-ingestion recovery

- [x] Classify the frontend-visible rejection against Core evidence, OCR-job, outbox, and worker result states using safe aggregate diagnostics; distinguish upload validation, delivery, provider availability, parsing, and terminal-attempt causes.
- [x] Repair the minimum bounded ingestion or retry-policy defect so a valid supported prescription does not remain stranded or prematurely terminal solely because of transient provider unavailability.
- [x] Use the three user-supplied prescription images only through the authorized automatic upload path, one controlled run at a time, with no manual medication transcription, no clinical recommendation, and no regimen submission.
- [ ] Verify persisted editable-draft counts and confidence-state aggregates, plus authorized caregiver visibility, then publish only the outcome categories and implementation details needed for future maintenance.

- [x] Replace the review-status-only OCR result with an asynchronous, provenance-preserving ML extraction contract that emits field-level medication candidates and confidence scores.
- [x] Persist a profile-scoped medication draft for each extracted candidate and mark fields at or above the requested 70% threshold as auto-populated; require editable correction for lower-confidence or missing fields.
- [x] Implement the authenticated frontend draft workflow: show asynchronous progress, populate the medication form from the draft, surface confidence and uncertainty, and submit an explicit user-approved draft to the existing medication command.
- [ ] Provide profile-authorized caregiver visibility into extraction provenance, draft state, confidence, corrections, and submission audit without making caregiver review a routine blocker.
- [ ] Deploy and acceptance-test the full real-file upload → queued extraction → auto-populated medication draft → user correction/submission path, then publish the completed contract to Storybook `main` and `next`.

> **Authorized-ingestion verification — 23 August 2026:** the original rejection was traced to a Gemini provider availability/quota response, rather than browser file validation, R2 upload, Core authorization, outbox delivery, dispatcher leasing, or the worker callback boundary. Core commit `4feb364` is active for the public API and isolated ML worker. Its quota-aware worker made a bounded primary-provider attempt, received a retryable quota response, used its configured bounded fallback, and Core accepted the result callback. One user-authorized PNG was then uploaded once through the signed-in Web workspace’s ordinary secure upload flow. Aggregate persisted state is `processed` evidence, one successful extraction, seven candidates, and seven editable drafts; all seven drafts remain `needs_correction`, and the submitted-draft count is zero. No raw OCR output, medication value, evidence URL, identifier, manual requeue, caregiver action, medication edit, or regimen creation/submission was used in this verification. The deployed fallback proved successful for this run; provider availability and quota still remain external dependencies, so future provider failures must continue through the bounded retry/defer policy rather than being concealed or fabricated. The currently signed-in production session is an owner context; delegated-caregiver runtime verification remains open despite self-access API coverage.

## Constrained production deployment handover

- [ ] Validate the supplied external Redis endpoint from the application runtime boundary; create it once as a sealed shared production variable and reference it from every Redis-dependent service before removing the Railway-managed Redis service.
- [ ] Deploy the isolated Gemini ML worker as the fifth Railway service with only its required sealed credentials and Core callback boundary.
- [ ] Apply migration `0017_automated_medication_drafts` before activating the schema-dependent Core API and worker release, then verify the existing prescription can produce a confidence-scored medication draft.
- [ ] Complete the dispatcher startup and automatic retry verification through browser-first Railway checks; use direct operational calls only when the browser cannot safely provide the required audited action, and do not create a new upload, draft, or regimen.
- [ ] Use the user-authorized autonomous approval flow for routine pending Railway deployments required by this verification; continue to exclude destructive changes, credential edits, patient-data access, new clinical data, and regimen submission.
- [x] Add and deploy an idempotent automatic recovery path for expired leased OCR jobs that transactionally schedules a new identifier-only OCR request event, then verify it only against the existing uploaded prescription.

> **Expired-lease recovery verification — 22 August 2026:** dispatcher commit `94fa619` is active in Railway. Its first production cycle safely recovered one expired OCR lease, emitted and delivered one identifier-only retry event, and did not dead-letter that recovery. The existing worker then leased the same job automatically twice; each R2 read completed and each Gemini call returned a retryable provider availability response. Both result callbacks were accepted by Core, but no third delivery appeared after the normal retry window. With the configured 12-attempt default and Core’s documented `attempts >= maxAttempts` conversion of a retryable result to a permanent failure, the bounded path has very likely reached the safe terminal outcome. No new upload, evidence, draft, manual requeue, caregiver gate, or regimen submission was created. Extraction and medication-draft success remain unverified; success-only Storybook operational documentation must remain deferred until a permitted existing-or-new verification input can complete against an available provider.
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
- [x] Research and select concrete Node/TypeScript, Drizzle, validation, Scalar, queue, AI/RAG, token-ledger, Docker, testing, and CI components.
- [x] Write the detailed inception, schema, filesystem, delivery-roadmap, and operational plan into the Nirog documentation library.
- [x] Create a private `nirog-backend` repository and bootstrap its workspace, packages, environment configuration, Docker, and development commands.
- [x] Implement the foundation: Drizzle schemas and migrations, RBAC/PBAC-ready access interfaces, Zod validation, Scalar/OpenAPI, worker contracts, AI usage ledger, and test harnesses.
- [x] Validate the local environment and publish both the documentation plan and backend foundation repositories.

The transactional core now supersedes the earlier FastAPI/SQLAlchemy implementation option: it will be Node.js/TypeScript with Fastify, TypeBox/JSON Schema validation, Drizzle and PostgreSQL. The existing modular-monolith, command ownership, RLS, persisted RBAC grant, PBAC evaluator, private-evidence, outbox, idempotency, and Flutter-authority rules remain unchanged. Python is not a second backend: it is a separately deployed ML/RAG worker process that receives bounded work references and returns through a narrow authenticated internal command boundary.

## Manual medication vertical slice

- [x] Implement and deploy profile-scoped manual prescription, regimen, local schedule, and dose-outcome records through a dedicated clinical schema and forward migration `0008_manual_medication.sql`.
- [x] Add the `@nirog/medication-domain` contract, profile-scoped Drizzle repository/request scope, permission-checked medication commands, TypeBox HTTP contracts, Fastify route registration, and generated OpenAPI snapshot.
- [x] Prove mutation idempotency, safe typed HTTP responses, and clinical profile isolation with Core API and disposable PostgreSQL RLS integration coverage.
- [x] Complete migration-first Railway rollout: the migrator applied clinical RLS before the matching API revision, and public liveness returned HTTP `200`.
- [x] Deploy the Phase 8 evidence foundation: prescription-evidence/OCR-job records, constrained Cloudflare R2 upload authorization, transactional OCR-job enqueueing, profile RLS isolation, and identifier-only audit/outbox events. Do not place raw evidence, image bytes, OCR text, or model output in audit/outbox payloads.
- [x] Generate a dedicated Core-to-worker secret locally and store it only as sealed Railway API configuration; it is never reused from Clerk, Neon, Redis, or R2 configuration and its value is neither committed nor documented.
- [x] Deploy the Phase 8 worker-boundary increment: secret-authenticated OCR lease/read/result routes, hashed opaque leases, R2 read authorization, controlled extraction storage, explicit review, retry/dead-letter handling, and worker-profile RLS isolation.
- [x] Implement and deploy the concrete OCR-engine worker peer: consume the dispatcher job reference, verify object metadata before extraction, call only the private lease/read/result routes, add observability and direct lease/stale-token integration coverage, and reuse the sealed service identity without storing it in code or logs.

### Phase 8 concrete-worker delivery gate

- [x] Add isolated worker coverage for authenticated ingress, schema rejection, stale-lease no-op, bounded download, OCR failure mapping, content routing, redacted logging, and temporary-file cleanup.
- [x] Run the complete Core lint, type, test, and OpenAPI verification gates; publish the reviewed worker/dispatcher implementation to Core.
- [x] Provision the isolated Railway OCR service and enable dispatcher delivery using a separate sealed dispatcher-to-worker secret; verify worker liveness without exposing service credentials.
- [x] Publish the concrete-worker operational contract to both Storybook branches and advance the task register to the Phase 9 reminder/adherence/refill increment.

> Deployment record (Phase 8, in progress): the isolated OCR Railway service has sealed direct Core-to-worker and dispatcher ingress credentials, plus bounded runtime controls; the dispatcher has the matching sealed ingress credential and private worker URL but remains disabled. The attempted shared-secret promotion was discarded to avoid widening secret visibility. Railway’s worker build was confirmed to use `workers/ml/Dockerfile`, including Tesseract and Poppler; startup then failed closed because at least one sealed worker secret did not meet the required 32-character minimum. The worker is not live and no OCR event delivery is enabled while the affected sealed credential is rotated safely.

> Remediation action: the dispatcher-to-worker credential was rotated as a newly generated matched sealed pair in the worker and dispatcher. The independent Core-to-worker identity was then rotated as a fresh matching sealed pair on the API and worker. The worker reached Railway `Online` and passed its configured `/health/live` deployment check. The API then entered a crashed state during its identity rollout, so dispatcher delivery remains disabled while the API restart is diagnosed and returned to a stable healthy state.

> Recovery record: the API startup failure was traced to `NIROG_RUNTIME_ROLE` having been unintentionally replaced during the identity-rotation edit. It was restored to the required `api` value and redeployed. Railway now reports the API `Online`; a direct unauthenticated request to `https://nirog.up.railway.app/health/live` returned HTTP `200`. The root `/health` route is not the configured public probe and remains protected by the global API authentication policy. Dispatcher delivery remains disabled until the worker configuration is re-validated and the end-to-end evidence flow is explicitly smoke-tested.

> Dispatcher hardening record: the dispatcher runtime-role field required the same correction to `dispatcher`; its OCR worker target was also blank and was restored to `http://nirog-core.railway.internal:8080`, matching the online worker service’s private Railway hostname and configured port. Both corrections are being redeployed with `OUTBOX_WORKER_ENABLED=false`. Because internal credential material was exposed during the configuration recovery process, the dispatcher-to-worker and Core-to-worker identities must both be rotated as fresh sealed pairs across their respective services before delivery is enabled; no secret value is retained in this record.

> Rotation progress: the dispatcher is online after its role and worker-target corrections. A fresh 64-character dispatcher-to-worker value was generated in transient configuration-session memory, saved on the dispatcher without printing it, and its deployment was applied while outbox delivery remains disabled. The online OCR worker has the corresponding `NIROG_DISPATCHER_TO_WORKER_SECRET` field ready for the matching update, and separately exposes the independent `NIROG_INTERNAL_WORKER_SECRET` field for the required Core-to-worker rotation. No worker has PostgreSQL, R2, or Clerk configuration.

> Competition deployment decision: the user confirmed that this Railway project is a competition test deployment and authorized continuation despite the local configuration-view exposure during recovery. The raw editor was closed without applying an unintended bulk change; no credential value is retained in this register. The acceptance gates below remain mandatory before OCR delivery is enabled.

- [x] Reconcile and redeploy a single fresh sealed `NIROG_INTERNAL_WORKER_SECRET` value across the API and OCR worker.
- [x] Verify the API, dispatcher, and OCR worker all return to stable `Online` status with their required runtime roles and the dispatcher’s private worker URL in place.
- [x] Verify the public API liveness endpoint returns HTTP `200`, restore `OCR_WORKER_URL` to `http://nirog-core.railway.internal:8080`, and confirm the dispatcher outbox is enabled only after the recovery gates are satisfied.
- [x] Execute and record the end-to-end prescription OCR smoke test: upload controlled evidence, observe the outbox/dispatcher/worker path, and confirm a `pending_review` extraction is created without automated medication mutation.
- [x] Repair and verify the R2 browser CORS policy required for the already-authorized synthetic evidence upload, using only the sandbox browser and preserving the existing Nirog/Google sign-in session.
- [x] Diagnose and restore write authorization through the existing Cloudflare connection before considering any Cloudflare dashboard login; do not alter, reveal, rotate, or revoke stored secrets.
- [x] Validate the newly supplied Cloudflare API token in-memory for account access and R2 CORS write scope; never persist, print, commit, or document its value.
- [x] Use the user-connected browser extension to set and verify the narrow `nirog` R2 CORS policy, then resume the already-authorized synthetic evidence upload without modifying unrelated Cloudflare resources.
- [x] Add and use a protected, session-bound web-companion smoke route that generates only synthetic evidence and forwards the authenticated Core workflow without exposing a browser token or creating an unrestricted production endpoint.
- [x] Complete all remaining Nirog implementation, smoke-test, and deployment work in the sandbox; reserve the user-connected browser strictly for Cloudflare access if a future R2 check is required.
- [x] Replace or correct the deployed R2 S3 Access Key ID and Secret Access Key used by Core presigning, then rerun one bounded synthetic upload to verify that `SignatureDoesNotMatch` is resolved before enqueuing OCR.
- [x] Replace the 1×1 synthetic smoke PNG with a readable, non-clinical text image so the real worker completes a successful OCR result and persists a `pending_review` extraction.

> Current verified state: API, dispatcher, and OCR worker are all Railway `Online`; the API’s public `/health/live` response is HTTP `200`; the API and worker use a newly reconciled Core-to-worker identity; the dispatcher target is `http://nirog-core.railway.internal:8080`; and Railway shows `OUTBOX_WORKER_ENABLED=true` after the dispatcher’s target correction was deployed. The next action is the controlled evidence-to-extraction smoke test.

> Smoke-test migration blocker: the authenticated competition smoke setup successfully created an isolated profile, but manual prescription creation returned HTTP `500`. The correlated API log identifies the direct cause: `relation "clinical.prescriptions" does not exist`. Railway’s migrator history had skipped later commits because its watched-file rules did not see a service-local change, leaving the current database behind the committed `0008_manual_medication.sql` and later migrations. A manual migrator redeploy was started from the completed worker-boundary revision; no prescription, evidence object, OCR job, or extraction will be retried until this migration-first run completes and its outcome is verified.

> Migration recovery result: manual Railway redeploy `d5c1b8dc` completed and the migrator logged `Nirog Core migrations completed.` The first post-migration prescription retry was rejected before reaching the command handler because its browser-carried Clerk session token had expired; the correlated API diagnostic is `invalid_token` / `clerk.token-expired`. The isolated profile remains available. The next controlled retry will first acquire a fresh session-bound Clerk token with cache bypass, then repeat only the manual prescription command.

> Reconciliation implementation: the migrator’s completed log exposed that historical migration rows can exist while the corresponding clinical objects remain absent. Core commit `943f518` adds the forward-only `0011_reconcile_clinical_schema.sql` artifact and Drizzle journal entry, restoring the Phase 7–8 medication, evidence, OCR, RLS, and worker-lease boundary objects when missing. It also adds a focused regression test for the artifact. Local verification passed with TypeScript typecheck and 45 passing tests (9 integration/environment skips); repository-wide formatting remains blocked by 41 pre-existing files outside this change. GitHub Actions run `32448277211` passed, including lint, typecheck, tests, and OpenAPI drift validation. The migrator must now be redeployed manually because its Railway watched-path configuration previously skipped changes outside its service directory.

> Deployment state: Railway deployment `6c30e413` for Core commit `943f518` was explicitly approved on the migrator first, in accordance with the migration-before-application rollout order. It is building the one-off migration image. The existing API, dispatcher, and worker remain unchanged while this run is in progress; controlled smoke commands remain paused until the migrator reports completion and its migration output is inspected.

> Deployment retry note: deployment `6c30e413` did not reach the migration command. Railway’s build failed because Corepack received HTTP `503` while downloading the already-pinned `pnpm@11.20.0` package from the public npm registry. This is an upstream transient package-fetch failure, not a migration, code, or database error. The safe next action is to retry the identical approved migrator deployment and inspect the resulting migration logs before any application-level retry.

> Rebuild trigger: the registry endpoint recovered with HTTP `200`. Railway does not expose a retry action for the failed one-off deployment, and its prior watched-file rule skipped database-only commits. Core commit `df0c5a2` therefore makes a non-functional, service-local migrator completion-log clarification, causing Railway to rebuild the exact CI-verified `943f518` reconciliation artifact through its normal source-change path. Local `pnpm typecheck` and the focused clinical-schema reconciliation migration test both passed before the trigger was pushed. The next acceptance gate is the migrator’s Railway output: it must report a completed migration run before the controlled prescription retry resumes.

> Migration execution verified: Railway deployment `43fc6478` completed successfully after the service-local rebuild was approved. Its deploy logs show the migrator executing its database work, including expected idempotent `already exists, skipping` notices for existing objects, and ending with `Nirog Core migration run completed.` The forward reconciliation is therefore live. The controlled retry may now create the minimal prescription parent record under the isolated competition profile, then proceed to the evidence-to-OCR test only if that command returns successfully.

> Post-reconciliation command result: a freshly refreshed Clerk session was handed to the Core origin only through transient same-tab state, then cleared. The isolated profile’s minimal manual-prescription request was authenticated but returned HTTP `500` with correlation ID `5dbdf971-fb30-41e0-b9a6-bf868fa44cc5`. No second write was issued. The server log for this correlation must be inspected before another retry; evidence upload and OCR dispatch remain paused.

> Final reconciliation root cause and repair: the correlated API error confirmed that `clinical.prescriptions` was still absent. Drizzle evaluates the journal by the entry `when` timestamp; reconciliation `0011` was registered at `1787287608436`, below existing migration `0006` at `1787298000000`, so the reconciler was silently skipped despite the migrator’s completion log. Because `0011` had never executed, its journal timestamp was safely moved to `1787298000001` and commit `49386b7` (`fix(db): correct reconciliation migration journal timestamp ordering`) added a focused regression assertion that the reconciliation timestamp exceeds every preceding entry. The focused Vitest test passed. Railway’s approved migrator deployment for this repair completed. The independently approved OCR-worker rollout is currently building; the next controlled action is a newly authenticated minimal prescription request to prove the table exists before any evidence upload.

> Session gate: on the first fresh-token attempt after the corrected migrator deployment, the signed-in companion page returned no usable browser-session token. No Core request was made and no token content was retained. The next action is to refresh the application session state and reacquire the transient token before sending the single minimal prescription command.

> Browser recovery note: the apparent companion-app navigation subsequently resolved to `about:blank`, which explains the absent Clerk client. This is a transient browser-navigation state rather than a signed-out decision. The browser session and cookies are preserved; return to `https://www.nirog.me/`, wait for the application origin to settle, and only then evaluate session readiness.

> Session recovery succeeded after the companion application completed hydration: a cache-bypassed signed-in token is now held only in transient same-tab state for the next one-shot verification request. The token value is not recorded. The next command will clear that handoff whether the prescription command succeeds or fails.

> Clinical migration verification passed: the refreshed authenticated command created the isolated smoke-test prescription with HTTP `201` and identifier `e910ce4c-43f4-4c51-b57f-ac5defd3348a` (correlation `59ee6277-9b3a-4bb5-ae5f-66e8bf428ceb`); the transient session handoff was cleared immediately. This proves `0011_reconcile_clinical_schema` executed after its timestamp repair. The controlled OCR smoke workflow may now proceed to a bounded, non-clinical sample evidence upload and extraction review; it must not create or mutate a medication automatically.

> Worker rollout gate passed: the independently approved OCR worker deployment is now Railway `Active` on commit `49386b7`, with a successful deployment record. The migration and worker runtime are both current. The next smoke action may upload only a synthetic non-clinical PNG containing test text, complete it through the public evidence API, and observe the resulting asynchronous extraction; no real prescription image or patient evidence will be used.

> Synthetic-evidence session gate: the browser-generated PNG sequence was stopped before authorization because the companion page did not expose a usable Clerk session token during that attempt. No evidence authorization, object upload, completion event, OCR job, or extraction was created. The next retry must first confirm the settled companion client exposes its signed-in session, then run this same one-shot synthetic upload flow.

> The companion origin has been reopened after the transient `about:blank` state and again renders the signed-in `Nirog | Care Ledger` workspace. The next action is an immediate session-readiness check on this settled page, followed by the already-defined one-shot synthetic evidence sequence only if that check succeeds.

> Cross-origin diagnosis: the synthetic-evidence sequence encountered a browser `TypeError: Failed to fetch` before it could return a stage result. A subsequent read-only evidence-list request from `https://www.nirog.me` to the Core API failed identically, confirming the current blocker is the browser’s cross-origin boundary rather than a decoded API problem response. The next diagnostic uses the same transient session handoff pattern on the Core origin to inspect the evidence list and, only with an unambiguous result, authorize the synthetic upload. No further companion-origin fetches will be used for this smoke path.

> The session handoff to the Core origin succeeded with a newly refreshed token held only in `window.name`; the browser’s unauthenticated rendering of Core root is expected because that navigation itself carries no bearer header. The following inspection request will include the bearer token and clear the handoff immediately after returning its read-only result.

> Same-origin evidence inspection returned HTTP `200` with an empty list, proving the previous cross-origin browser failure did not create an `upload_authorized` evidence record. Core’s current first-party source has no browser CORS plugin because the companion uses its own authenticated server-side proxy in normal product flows; this does not affect the same-origin diagnostic route. A newly refreshed bearer handoff is ready solely for the next controlled Core-origin authorization attempt.

> Synthetic upload boundary result: Core successfully authorized one bounded synthetic PNG evidence record (`3d0f8de0-cf14-443f-af7f-097f55c7b3f9`), but the browser’s direct `PUT` to the short-lived Cloudflare R2 URL failed at the fetch/CORS layer from the Core origin. The completion endpoint was not called, so no OCR job or extraction was created. This isolates the remaining Phase 8 smoke blocker to the R2 bucket’s browser CORS policy. The next corrective action is to permit the authenticated browser origins used for direct presigned uploads—at minimum `https://www.nirog.me` and the Core-origin diagnostic route—or otherwise exercise the signed upload through a non-browser S3 client, then resume only this existing authorized synthetic evidence record.

> Browser constraint: the user requested that all remaining verification use the sandbox browser only. Do not request or activate access to the user’s personal browser. Preserve the existing Nirog/Google sign-in session; do not clear cookies or log out.

> R2 CORS administration status: the built-in Cloudflare connector was enabled but its API credential returned an authentication error, and the sandbox browser’s Cloudflare dashboard session is not signed in. The sandbox browser successfully reached the Cloudflare Google sign-in flow using the existing account that matches the R2 account identity, but Google now requires a device verification prompt on the linked phone. No personal-browser connector is needed or will be used.

> User direction: use the pre-existing Cloudflare connection first. The connector’s masking of stored credential values is a display behavior; it did not modify any actual secret or Railway configuration. Keep all values sealed and untouched. Escalate to a Cloudflare browser login only if the connection cannot be given the needed R2 CORS write capability.

> Token validation protocol: the user supplied a replacement Cloudflare API token for a one-time account and R2 permission check. Use it only in process memory, report validity and capability without reproducing the value, and do not persist it to source, task notes, configuration, shell history, or documentation.

> Supplied-token result: the provider’s token-verification endpoint accepted the supplied token (HTTP `200`), but the token was denied (`403`, Cloudflare code `10000`) when reading the R2 bucket inventory for the account that owns `nirog`; the account-list response also returned no visible account identifiers. The token is therefore valid but is not authorized for the configured R2 account and cannot set its CORS policy. The next token must be scoped to the `nirog` bucket’s owning Cloudflare account with **Workers R2 Storage: Edit** (and Read for verification).

> Browser direction updated: the user installed and authorized their browser extension for this task. Use that connected browser only for the Cloudflare R2 CORS setting and verification; retain the sandbox browser session for Nirog smoke testing and do not alter unrelated account resources.

> Connected-browser verification: the user-connected browser is authenticated to the Cloudflare account corresponding to the configured R2 endpoint and shows `R2 / nirog` as a recent resource. This establishes the correct account context for the narrow bucket CORS update; no other Cloudflare resources will be changed.

> Bucket navigation verified: the connected browser is open to the `nirog` R2 bucket, whose object listing is empty and whose Settings tab is available. The next operation is limited to the bucket’s CORS configuration; do not change public access, storage class, lifecycle, object content, or any other Cloudflare resource.

> CORS editor verification: the `nirog` bucket has no existing CORS policy. The Cloudflare editor is open and expects an R2 CORS JSON array. The pending minimal rule permits only `https://www.nirog.me` and the Core diagnostic origin, methods `PUT`, `GET`, and `HEAD`, request header `content-type`, exposed header `ETag`, and a 3600-second preflight cache. It does not enable public bucket access or modify object permissions.

> CORS repair completed: Cloudflare persisted the reviewed bucket policy. The Settings page now shows the two allowed origins (`https://www.nirog.me` and `https://nirog.up.railway.app`), allowed methods (`PUT`, `GET`, `HEAD`), and allowed header (`content-type`). Public development URL remains disabled and no unrelated bucket configuration was changed. The next operation returns to the sandbox browser to resume the same authorized synthetic evidence upload.

> Smoke-profile continuity verified: the connected browser’s Nirog companion application is signed into the account that owns the isolated `Competition OCR Smoke Test` profile. The existing prescription and its authorized synthetic evidence record can therefore be resumed without creating a different patient context or additional test profile.

> Handoff sequencing note: an unauthenticated navigation to the Core root occurred before a fresh bearer handoff was prepared; it returned the expected HTTP `401` root response and performed no data operation. The connected browser has returned to the signed-in Nirog companion. The next action is to set a short-lived same-tab handoff before returning to Core.

> Connected-browser session gate passed: the Nirog companion has completed refresh and visibly identifies `Competition OCR Smoke Test` as the active profile. No subsequent Core request has yet been issued. A new cache-bypassed bearer token may now be held only in transient same-tab state for the resumed existing-evidence workflow.

> Post-save browser handling note: one stale-page interaction failed before it could target a field, and a subsequent Cloudflare settings navigation was view-only. Neither operation changed CORS or any other bucket configuration. The persisted CORS policy remains the sole infrastructure mutation in this recovery sequence.

> Connected-browser status remains healthy: after navigation recovery, the browser again shows the isolated `Competition OCR Smoke Test` profile as active. No additional clinical, evidence, OCR, or Cloudflare mutation was made during the recovery. The next smoke-test action must use a non-repetitive authenticated execution path rather than further browser reloads.

> OCR fixture constraint confirmed: the worker omits blank OCR text safely when reporting a successful result, so a valid non-clinical synthetic PNG does not need medication-like content to create a pending-review extraction. The remaining technical requirement is an authenticated way to resume the existing evidence record or authorize one replacement record without further browser-navigation loops.

> Execution-path adjustment: because the browser automation surface does not provide a stable script-console action for the connected browser, complete the controlled smoke flow through a temporary protected route in the existing web companion. The route must use Clerk’s server-side session token, be restricted to the isolated profile and synthetic test content, return only identifiers/statuses, and be removed after verification unless retained as a documented test-only mechanism.

> Protected smoke route verification: `nirog-web` now contains `/api/core/phase-8-smoke`, a dynamic Clerk-session-bound route restricted to the isolated smoke profile and synthetic 1×1 PNG. `pnpm lint` passed. A production build with `NODE_ENV=production` also passed and lists both `POST` and `GET` route handling under `/api/core/phase-8-smoke`. The repository’s default shell `NODE_ENV` is non-standard and causes an unrelated `/_global-error` prerender failure; production hosting already uses the correct environment mode.

> R2 signing diagnosis: the protected sandbox smoke route authenticated successfully and obtained a new presigned upload URL, but the server-side `PUT` returned Cloudflare R2 HTTP `403` with `SignatureDoesNotMatch`. The requested `Content-Type` matches the signed `image/png` contract; therefore the remaining fault is the deployed S3 signing key pair or its account association, not browser CORS, Core authorization, or request headers. Cloudflare documents this error as a signature/secret-key or signing-algorithm mismatch; their published JavaScript v3 example matches Core’s endpoint and `Content-Type` signing pattern. The CORS policy is already correct and should remain unchanged.

> Cloudflare account verification: the authenticated R2 overview confirms the deployed endpoint is exactly `https://31bdd67db1cb4ef613270147c715fdee.r2.cloudflarestorage.com`, the `nirog` bucket exists, and the current dashboard exposes **Manage API Tokens** from the R2 overview. This confirms endpoint configuration is correct and isolates the repair to the S3 credential pair used by Core for presigning.

> Replacement-credential plan: Cloudflare’s current R2 dashboard supports an account API token suited to the production signing service. The pending token will use **Object Read & Write** only, apply to the **specific `nirog` bucket** only, and omit administrator permissions, all-bucket scope, and IP filtering. It will replace only Core’s sealed presigning access-key pair after its one-time secret display is captured directly into Railway configuration.

> Replacement S3 credential created: Cloudflare created the account-scoped `nirog-core-evidence-presigning` credential with Object Read & Write permission restricted to the `nirog` bucket. The one-time S3 Access Key ID and Secret Access Key display is active. Their values are intentionally not retained in this task register, source, documentation, command history, or logs. The next step transfers both directly into Railway’s sealed Core configuration, then verifies a newly generated presigned upload.

> Sealed deployment configuration updated: the replacement S3 Access Key ID and Secret Access Key were entered directly into the two masked `@nirog/api` service variables through Railway’s authenticated sandbox session. Neither value was printed, committed, retained in the task register, or written to project source; the temporary local transfer helpers were deleted immediately. Railway now has staged API configuration changes that must be deployed before the next synthetic upload verification.

> OCR smoke diagnosis: after the credential rollout, a fresh protected smoke request successfully authorized, uploaded, completed, and enqueued OCR (`evidenceId` `39867727-5828-427e-acb7-e53e8c4dd8cd`; `ocrJobId` `92df49b0-bbe0-4ba4-97a5-93c2d24fd8aa`). The extraction list remained empty because the existing 1×1 PNG produces empty Tesseract output. The worker correctly classifies empty OCR text as a permanent failure, and Core persists extraction rows only for successful results. The storage, completion, and asynchronous handoff gates are therefore functioning; the final smoke artifact must contain legible non-clinical text to verify the successful pending-review branch.

> Browser-boundary clarification: proceed autonomously. Use the sandbox browser and sandbox workspace for all Nirog work. The connected browser is reserved only for Cloudflare administration and no user response is needed for routine implementation, verification, or deployment actions.

Core commit `2acf528` delivers the manual medication vertical slice. It exposes `GET /api/v1/profiles/:profileId/medications`, plus idempotent creation routes for manual prescriptions, regimens with local-time schedules, and dose outcomes. The only clinical authority path is profile ownership or a persisted `regimen.*`/`adherence.*` permission snapshot; platform roles remain outside all medication policies. The verified Core suite reports 38 passing tests with 7 environment-dependent integration tests skipped locally, while GitHub Actions run `32364153819` passed. Railway migrator and API deployments both completed successfully, and `https://nirog.up.railway.app/api/v1/health/live` returned HTTP `200`.

Core commit `d6d5505` delivers the Phase 8 evidence foundation. It adds forward migration `0009_prescription_evidence_ocr.sql`, profile-bound evidence and OCR-job records, constrained R2 upload authorization, completion-to-outbox enqueueing, safe metadata routes, and a production fail-closed requirement for `NIROG_INTERNAL_WORKER_SECRET` when R2 evidence storage is active. GitHub Actions run `32371786274` passed; Railway applied migration `0009` through the migrator before activating the matching API revision; public liveness returned HTTP `200`. A worker is intentionally not yet deployed, and no OCR text, extraction result, automated medication change, or public object URL is available in this foundation release.

Core commit `7a29173` delivers the worker-facing Phase 8 boundary. It adds forward migration `0010_ocr_worker_boundary.sql`, a hashed opaque lease token, private secret-authenticated lease/read/result routes excluded from mobile OpenAPI, controlled extraction/review commands, and Core-owned retry/dead-letter transitions. GitHub Actions run `32374259187` passed; Railway applied migration `0010` through the migrator before activating the matching API revision; public liveness returned HTTP `200`. The API boundary is deployed, but no concrete OCR-engine worker process is yet provisioned, and no automated medication mutation is possible.

## Phase 8 completion record — prescription evidence and OCR worker

- [x] Complete an authenticated, bounded synthetic evidence upload through the web companion and Cloudflare R2 presigning path.
- [x] Observe the PostgreSQL outbox, Railway dispatcher, private OCR worker, Core lease/read/result boundary, and review projection end to end.
- [x] Persist a `pending_review` extraction containing only readable non-clinical smoke text; automated medication mutation remains prohibited.
- [x] Repair the Core OCR lease eligibility comparison to use PostgreSQL `now()` and add a focused regression test for the Date-serialization defect found during deployment verification.
- [x] Deploy the reviewed API-only fix after the completed migrator gate; Core liveness is healthy and the fresh smoke job completed successfully.
- [x] Publish the concrete-worker service contract and record Phase 8 completion on both Storybook branches.

> **Acceptance result:** the final protected smoke job created synthetic evidence `3fd7086e-f067-4252-9894-58da9b588874`, an OCR job, and one Core-owned `pending_review` extraction whose raw text was exactly the bounded synthetic test content. The dispatcher and worker used private authenticated boundaries; neither the worker nor the outbox payload held clinical database credentials, R2 credentials, Clerk credentials, signed URLs, or clinical text. Core produced the extraction only after a successful worker result, and no medication data changed automatically.

## Phase 9 — reminders, adherence analytics, and refill workflows

- [x] Define the reminder, adherence, and refill domain contracts and forward-only clinical migration.
- [x] Implement timezone-aware reminder schedules, dose-time windows, snooze state, and idempotent identifier-only due-dispatch contracts.
- [x] Implement persisted profile-scoped daily adherence metrics and streak projections from immutable dose outcomes.
- [x] Add profile-scoped weekly and monthly adherence aggregation read models.
- [x] Implement stock balances, refill thresholds, alert acknowledgement, and dose-linked inventory movements without coupling them to OCR output.
- [x] Add the profile-scoped refill-history query read model.
- [x] Add the Phase 9 profile-RLS foundation, migration regression guard, and Storybook architecture contract.
- [x] Add Phase 9 permission, validation, API, outbox, and deterministic worker-boundary tests for the implemented command and query slices.
- [x] Run the bounded authenticated smoke path and database-backed concurrent-claim/RLS checks against the deployed test environment.

> **Foundation deployment record:** Core commit `c6fe269` adds migration `0012_reminders_adherence_refills.sql`, Drizzle schema definitions, profile ownership propagation for the existing regimen schedule, and a focused journal/migration regression test. The migration materializes no reminder and sends no notification: it establishes profile-scoped reminder schedule/occurrence, adherence daily/streak, inventory ledger, and refill-alert records only. Local lint, TypeScript, and the complete Core unit suite passed with 47 tests passing and 9 environment-dependent skips. Railway approved and completed the migrator deployment before approving the matching API deployment; the API is online. The next slice is command-layer behavior and deterministic due-work materialization, not external notification-provider delivery.

> **Adherence and Phase 9 deployment record:** Core commits `d7694fd`, `4d350fd`, and `6616e78` add and repair migration `0014_adherence_timezone_metric_key.sql`, persist daily metrics and streaks after dose recording, and expose authorized daily-metric and streak reporting routes. Migration 0014 completed successfully in Railway after the old table-level uniqueness constraint was corrected to a constraint drop. Subsequent Core commits `1520edd`, `80e03a5`, `39d5f3f`, `c41659d`, `7d72603`, and `a614eed` add deterministic due-intent dispatch, reminder snooze/acknowledgement transitions, source-dose-linked inventory deduction, refill-alert acknowledgement, weekly/monthly adherence summaries, the newest-first refill-history read model, and integration coverage. The complete Core verification passes with 63 tests and 9 environment-dependent skips. Railway has the due worker enabled in the dispatcher test environment; the API deployment for `a614eed` was approved after the migrator remained completed, and the matching OCR worker deployment was approved in the test environment. The final operational acceptance checks are complete: the authenticated synthetic OCR smoke path returned HTTP 200 through Nirog Web, the two-connection due-row race produced exactly one winner and one identifier-only outbox event, the one-open-refill-alert race produced exactly one successful insert, and the database-backed profile-RLS suite passed all 9 tests against the supplied test Neon database. The test database required a source-aligned ACL/RLS reconciliation because migrations had been recorded before the `nirog_api` role existed; this was a test-environment state repair only.

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
- [x] Complete the intentionally deferred user-domain routes: team invitation create/accept, signed Clerk/Svix lifecycle webhook ingestion, device registration, and consent management.
- [x] Add live PostgreSQL migration, security-definer/RLS, outbox atomicity, webhook replay, and Docker/CI integration coverage; then publish the user-slice completion updates.

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

- [x] Restart the temporary API using user-supplied Clerk credentials held only in the active sandbox process, then verify a real Clerk bearer token against a protected user endpoint without persisting secrets.

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
- [x] Verify the fixed authenticated request path and publish the Core, Web, and documentation update if required.
- [x] Diagnose the renewed live `401 UNAUTHENTICATED` after the Clerk session audience claim was added, using only safe correlation/claim-presence diagnostics to isolate audience, authorized-party, issuer/key, or deployment-version mismatch.
- [x] Restore the Railway API service from the reported startup loop by replacing the invalid R2 custom-domain endpoint with the Cloudflare account S3 endpoint, then collect the safe Clerk verifier diagnostic from a live request.

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
- [x] Retest one authenticated Nirog Web request now that the database migration and all Railway services are healthy; use the safe Clerk verifier diagnostic only if the response remains `401`.
- [x] Capture the new Railway migrator failure after its brief healthy state and determine whether it is a one-shot process lifecycle issue or a new migration error.
- [x] Capture the safe Core `authDiagnostic` category for the still-failing signed-in Web request, then correct only the remaining Clerk claim, origin, issuer, or deployment mismatch.

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

- [x] Implement and verify the manual medication vertical slice with typed Core routes, profile-scoped RLS, audit/outbox evidence, disposable PostgreSQL assertions, and generated Scalar/OpenAPI documentation.

> **Manual medication increment record:** The manual medication vertical slice is already implemented and mounted in Core. It provides profile-authorized regimen listing, idempotent manual prescription creation, idempotent regimen creation with recurring local schedules, and idempotent dose-outcome recording. The implementation uses the existing profile-grant permission boundary, request-scoped PostgreSQL RLS, identifier-only audit/outbox evidence, and downstream adherence/inventory projections. Core verification passes with `pnpm typecheck`, `pnpm lint`, and `pnpm test`; the complete suite reports 63 passing tests and 9 environment-dependent skips. The Storybook checkbox was stale and is now reconciled with the shipped code and tests.

The next bounded increment is the authenticated prescription-evidence/OCR workflow, using demo fixtures until the ML team delivers real OCR output. OCR results must remain advisory and may not create or change medication authority; every demo result must be machine-marked with `resultSource: "demo"` and a `demoFixtureId` matching `demo.[A-Za-z0-9._-]{1,127}`. Real ML output will use `resultSource: "ml"` and no fixture identifier.

- [x] Implement and verify explicit OCR result provenance in Core, including migration `0015_ocr_result_provenance.sql`, route/application/repository threading, public extraction markers, and focused validation tests.

> **OCR provenance increment record:** Core commit `863aa1c` adds `result_source` and `demo_fixture_id` to `clinical.ocr_extractions`, rejects invalid demo/ML combinations in both the command and database constraint, and keeps the markers in safe audit/outbox/result projections without exposing OCR text or patient data there. `pnpm typecheck`, `pnpm lint`, and `pnpm test` passed with 68 passing tests and 9 environment-dependent skips. Railway applied migration 0015 through `@nirog/migrator` first, then deployed `@nirog/api`; both services are online in the test environment.

- [x] Implement and verify the demo-backed OCR worker path with deterministic synthetic output, explicit `resultSource: "demo"`, a validated `demoFixtureId`, no real OCR-engine runtime dependency, and Core-client payload coverage.

> **Demo worker increment record:** Worker commit `a78d9be` requires `OCR_DEMO_FIXTURE_ID`, currently configured as `demo.prescription-v1`, renders only marked synthetic text (`NIROG DEMO OCR`, `SYNTHETIC DOCUMENT`, `NO CLINICAL DATA`), bypasses evidence downloads and real OCR execution, and emits the provenance marker on every result. The worker suite passed 15 tests; the Core TypeScript, lint, and full test gates passed with 68 tests and 9 environment-dependent skips. Railway activated the
 worker after the API/migrator deployment order was already satisfied. No medication, regimen, reminder, refill, or dose action is triggered by demo output.

- [x] Implement, verify, and deploy the Core-linked signed OCR/ML Lab correlation assertion and confirmed-only identifier receipt, including migration `0016_core_linked_ocr_lab_receipts.sql`, nonce/trace replay protection, SHA-256 reason hashing, and OCR/ML adapter coverage.

> **Core-linked correlation increment record:** Core commit `a95511b` binds a user-authorized profile/evidence/job tuple into a version-1 HMAC-SHA-256 assertion with a fresh nonce and five-minute expiry. Core receives Lab packets only at `POST /api/v1/internal/ocr/lab-review-packets`, with the sealed worker secret and required idempotency key. It accepts only `decision: "confirmed"`, validates demo/ML provenance, persists a nonce-hash/trace-unique identifier-only receipt, and emits no OCR text, medicine/regimen candidate, diagnosis hypothesis, review reason text, image, object reference, or secret in audit/outbox evidence. The Lab hashes its mandatory plaintext review reason before delivery and refuses to send unconfirmed jobs. Core `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed; the OCR/ML adapter/review-control test suite and type check passed. Railway completed migration `0016` through `@nirog/migrator` before activating `@nirog/api`; the API and OCR worker deployments are both active, and the non-mutating live worker-credential probe reached the expected unknown-job `404`.

**Standing delivery rule:** after each increment has passed local verification, GitHub Actions, migration-first Railway deployment, public health validation, and Storybook synchronization, automatically plan and begin the next bounded increment. Do not pause for routine approval; pause only for an operator-only secret, a non-inferable real-world identity decision, a destructive action, or a material safety conflict.

The stack must preserve a modular FastAPI/Python monolith with explicit application/domain/port/infrastructure layers, strict Pydantic transport models and immutable command types, PostgreSQL as the canonical authority with transaction-scoped RLS defense in depth, private object storage for evidence, a Redis-compatible broker/cache, separately scaled worker pools, OIDC/OAuth2 actor resolution, current profile capability evaluation, RBAC with a future policy evaluator seam, Flutter-safe OpenAPI/change-feed contracts, transactional outbox/idempotency, and redacted end-to-end observability.
