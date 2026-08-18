# Access, ML, Flutter, and Contract Stack

## Access stack

Implement one `OidcVerifier` port that validates issuer, JWKS key, audience, algorithm, expiry, and subject. Use a cached JWKS client with bounded refresh and never let unvalidated token claims reach business code. The verifier produces the minimal immutable `ActorContext`.

The `ProfilePolicyService` resolves the owner or a live `identity.profile_access` grant, validates the persisted permission snapshot, asks the resource owner for a relation fact, and checks consent/purpose where required. It returns a short-lived `ProfileCapability` for the current command. Roles are templates at grant creation; authorization uses the stored permission set. A `PolicyEvaluator` protocol remains the future PBAC seam and begins in RBAC-equivalence shadow mode.

## ML and OCR stack

Implement OCR behind `PrescriptionOcrPort` and keep the provider outside the domain. The first self-hosted baseline is **PaddleOCR with ONNX Runtime** in the ML worker pool, packaged separately from the API image. It supports deterministic model/version manifests and keeps restricted image data in the private processing boundary. A managed OCR provider can be added only as a module-owned adapter after data-residency, contract, redaction, evaluation, timeout, deterministic request-key, and purge requirements are approved.

The worker emits stage results, candidate lists, fingerprints, and review payloads. It cannot create a medication schedule or write `regimen.*`. A confirmation route calls the normal Regimen command after access, evidence-version, catalog-release, validation, and idempotency checks.

## Flutter and API contract

FastAPI exports an OpenAPI 3.1 specification per release. Run Redocly CLI in CI with Nirog-specific standards: unique stable `operationId`, explicit problem responses, security declaration, pagination conventions, no untyped object payloads, and deprecation metadata. Redocly supports project-specific lint rules and GitHub Actions output. [1]

Generate a Dart/Dio client from only the validated OpenAPI artifact. Flutter uses `freezed` and `json_serializable` for immutable DTOs, `Drift` for local intent/outbox storage, and a server-defined change feed for synchronization. Every mutation includes idempotency and expected-version data; the server returns safe conflict receipts. Flutter never calculates permission, schedule authority, consent, dose evidence, or PBAC policy offline.

## Documentation split

Storybook MDX/Mermaid remains the reviewed human architecture and workflow library. The FastAPI OpenAPI artifact is the executable interface contract. Redocly supplies linting and generated reference material; ADRs in the backend repository explain irreversible decisions, migration choices, and accepted exceptions. These three artifacts stay linked by release/version identifiers.

## References

[1] [Redocly CLI — lint](https://redocly.com/docs/cli/commands/lint)
