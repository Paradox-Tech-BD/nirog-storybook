# Technical Analysis References

| Source | Technical use |
|---|---|
| [OWASP API1:2023 Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) | Requires authorization checks for every client-supplied object identifier; informs profile-scoped repository/policy design. |
| [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html) | Identity/authentication protocol basis for external providers and stable issuer/subject mapping. |
| [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) | Defense-in-depth option for profile-scoped tables; documents default-deny and policy behavior. |
| [Transactional Outbox Pattern, Microservices.io](https://microservices.io/patterns/data/transactional-outbox.html) | Reliable committed-event publication and idempotent consumer requirement. |
| [Celery Tasks documentation](https://docs.celeryq.dev/en/stable/userguide/tasks.html) | Idempotent tasks, acknowledgements, retries, backoff, routing, logging, and sensitive-argument cautions. |
| [Transactional Outbox Pattern, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) | Duplicate delivery, ordering, outbox relay, and consumer deduplication considerations. |

The technical recommendations in this pack combine these sources with the Nirog pre-analysis. They remain implementation architecture, not a claim that any named vendor or library is mandatory.

