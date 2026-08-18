# Clerk Webhook and Local Account Lifecycle — Research Notes

Clerk’s `user.created`, `user.updated`, and `user.deleted` webhooks are useful for synchronizing a limited local account projection, but Clerk explicitly describes webhook delivery as asynchronous and eventually consistent. Deliveries can fail and be replayed, so a webhook cannot be the only path for an authenticated user to enter Nirog Core. [1] [2]

Nirog Core therefore uses two complementary mechanisms. First, the verified Clerk JWT `iss` and `sub` make a synchronous, idempotent **just-in-time account provision** possible on the first authenticated request. The Core creates a minimal `identity.accounts` record and default preferences in the same transaction only when the `(issuer, clerk_user_id)` pair is new. Second, verified Clerk webhooks maintain the non-authoritative display projection and react to lifecycle changes such as user update/deletion. The webhook consumer stores an immutable delivery/replay record, is idempotent on provider event ID, and writes a redacted audit event plus outbox row.

The webhook route is public to authentication middleware but requires Clerk/Svix signature verification over the original request. It never accepts a client bearer token as webhook proof. Clerk’s `verifyWebhook()` helper validates the request with the configured webhook signing secret. Nirog will subscribe only to the lifecycle events required for the local projection, initially `user.created`, `user.updated`, and `user.deleted`; it will not mirror arbitrary Clerk metadata. [1] [3]

On `user.deleted`, Nirog does not cascade-delete clinical records. It transitions the local account to a privacy/governance workflow state, revokes active profile grants and device sessions, preserves legally required audit records, and emits an account-deactivated event. Existing health-record retention and subject-request controls remain the authority for any later deletion or anonymization operation.

## Sources

[1] [Clerk — Sync data with webhooks](https://clerk.com/docs/guides/development/webhooks/syncing)

[2] [Clerk — Webhooks overview](https://clerk.com/docs/guides/development/webhooks/overview)

[3] [Clerk `verifyWebhook()` reference](https://clerk.com/docs/reference/backend/verify-webhook)
