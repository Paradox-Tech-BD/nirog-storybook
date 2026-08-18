# Software and Access Architecture Research Notes

## RBAC baseline

The [NIST RBAC project](https://csrc.nist.gov/projects/role-based-access-control) describes RBAC as assigning users to roles and roles to privileges. It notes that RBAC reduces per-user administration complexity and identifies users, roles, permissions, operations, and objects as core RBAC elements. Nirog uses this as the **administrative baseline**, not as the full profile-resource decision: a role supplies a governed permission template, while a profile-specific grant persists a permission snapshot that does not silently broaden if an administrator later changes the role template.

The NIST project page is marked archived; its standard/background material is still useful for the model, but Nirog’s detailed implementation rules are determined by the current system architecture, product constraints, and validation/test contracts.

## Future PBAC and attributes

The [NIST policy-based access control glossary](https://csrc.nist.gov/glossary/term/policy_based_access_control) defines PBAC as policy-driven authorization that can evaluate flexible parameters such as identity, role, clearance, operational need, risk, and heuristics. Nirog uses **PBAC** to mean a versioned policy-decision/evaluation layer, not an immediate vendor or policy-language selection.

The [NIST ABAC project](https://csrc.nist.gov/projects/attribute-based-access-control) describes rules evaluated against subject, object, action, and environment attributes. This supports Nirog’s future extension seam: role and relationship remain input attributes; profile ownership/grant, consent/purpose, resource classification, device/session posture, time window, lifecycle status, and policy release can be evaluated by a future policy decision point. The MVP does not require a general ABAC engine.

## Authorization practices

The [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) recommends least privilege, deny-by-default, per-request permission checks, policy/logging/test coverage, and recognizes that roles alone do not handle all object-level, relationship, and contextual decisions. Nirog applies RBAC only as a clear, reviewable permission-assignment baseline. Every profile resource access additionally checks current relation, scoped target, consent/purpose where applicable, and state.

## Validation practices

The [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) distinguishes syntactic validation from semantic business validation and recommends early server-side allowlist/type/range/length validation. The [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) further recommends access checks per endpoint, workflow-state validation, content-type/size controls, safe errors, audit, and no reliance on a client to enforce endpoint order.

For Nirog, a valid request must pass transport/content validation, Pydantic/API shape validation, authenticated actor validation, RBAC/permission check, profile/resource relation check, consent/purpose check, current aggregate state and version check, module business validation, idempotency check, persistence constraint, and audit/outbox transaction. Client-side validation is UX only.
