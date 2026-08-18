# Nirog Implementation Inception — Research Notes

## Strapi platform findings

Strapi is an open-source JavaScript/TypeScript headless CMS that provides a React administration interface, generated content APIs, a plugin system, and a request pipeline of routes, middlewares, controllers, and services. Its official source is `strapi/strapi` on the `develop` branch; the upstream monorepo uses Yarn 4 and Nx, and its server is Koa rather than Fastify. [1] [2]

The checked official source has an internal `@strapi/database` package that depends on **Knex 3.0.1** and manages content types through Strapi’s own JSON content-type notation and migrations. It is therefore not a maintainable candidate for replacing with Drizzle inside a direct upstream fork. A direct core fork would couple Nirog to upstream Koa, Knex, schema generation, and migration internals, while the requested Drizzle/RLS ownership model would require an extensive permanent divergence.

Strapi’s supported extension mechanisms are plugins, `src/extensions`, and application `register()`/`bootstrap()` hooks. The official documentation warns that upstream plugin updates can break extensions and recommends a plugin fork for extensive customization. [3] This supports using Strapi as a separately versioned, bounded administration and curation plane instead of making it the health-data transaction core.

The user-referenced guidance repositories are real: `strapi/javascript` is a small JavaScript style guide, and `strapi/eslint-config` is an internal-work-in-progress ESLint configuration. The source repository also carries `AGENTS.md`, contributor rules, lint/format standards, conventional commits, strong typing guidance, and broad test layers. [4] [5] The Nirog backend should adopt the durable principles—dependency injection, factory composition, strict typing, parameterized queries, validation at boundaries, conventional commits, and layered tests—but not depend directly on the outdated/internally mutable style-guide packages.

## Drizzle and TypeScript core findings

Drizzle supports codebase-first TypeScript schemas, generated SQL migrations, explicit transaction configuration, and PostgreSQL RLS declarations. [6] [7] The currently documented relations/RLS surface is associated with the v1 beta documentation, so Nirog will use Drizzle for typed schema definitions and generated SQL migrations while retaining **reviewed, explicit SQL migration sections** for PostgreSQL roles, `SET LOCAL` request context functions, RLS policies, extensions, partial indexes, concurrent indexes, and grants. The runtime application never uses a table-owner or `BYPASSRLS` role.

Fastify 5 uses compiled JSON Schema for request validation and response serialization, and its official TypeBox type-provider integrates runtime schemas with TypeScript inference. Fastify documents that database work must not occur in initial validation and should happen in later hooks/application handlers. [8] [9] Scalar’s Fastify package can serve an interactive API reference from the Fastify-generated OpenAPI document. [10]

The Node project advises using Active or Maintenance LTS releases in production; Node 24 is the current LTS line. [11] A `pnpm` workspace gives the Nirog repository a single lockfile and explicit local dependency boundaries through the `workspace:` protocol. [12]

## Async, RAG, and local environment findings

Amazon SQS provides queue-to-dead-letter routing through a redrive policy, `maxReceiveCount`, and controlled redrive. [13] LocalStack supports SQS APIs, DLQ behavior, and redrive testing in Docker. [14] Nirog will therefore use SQS as a cross-language delivery transport, with PostgreSQL outbox and consumer ledger as authority. The Node service publishes versioned envelopes only after a committed transaction; the Python worker verifies envelope schema and current state through a narrow internal API/command before restricted work or output commit.

pgvector supports exact and approximate nearest-neighbor search in PostgreSQL. HNSW improves speed/recall trade-offs at the expense of build time and memory, and filtered approximate queries require deliberate recall testing. [15] Nirog will not introduce a separate vector database at inception. A restricted `ai` schema with `pgvector` is sufficient for approved non-clinical retrieval, cited knowledge retrieval, and catalog support; every document chunk, embedding, query, retrieval result, and model/prompt release is profile/purpose-scoped and auditable. RAG output remains evidence or assistance, never medication action.

## Source register

[1] [Strapi source repository](https://github.com/strapi/strapi)

[2] [Strapi upstream agent guide](https://github.com/strapi/strapi/blob/develop/AGENTS.md)

[3] [Strapi 5 — Plugin extensions](https://docs.strapi.io/cms/plugins-development/plugins-extension)

[4] [Strapi JavaScript Style Guide](https://github.com/strapi/javascript)

[5] [Strapi shared ESLint configuration](https://github.com/strapi/eslint-config)

[6] [Drizzle migrations fundamentals](https://orm.drizzle.team/docs/migrations)

[7] [Drizzle transactions and RLS](https://orm.drizzle.team/docs/transactions) and [RLS](https://orm.drizzle.team/docs/rls)

[8] [Fastify validation and serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)

[9] [Fastify Type Providers](https://fastify.dev/docs/latest/Reference/Type-Providers/)

[10] [Scalar API Reference for Fastify](https://scalar.com/products/api-references/integrations/fastify)

[11] [Node.js releases](https://nodejs.org/en/about/previous-releases)

[12] [pnpm workspaces](https://pnpm.io/workspaces)

[13] [Amazon SQS dead-letter queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html)

[14] [LocalStack SQS](https://docs.localstack.cloud/aws/services/sqs/)

[15] [pgvector](https://github.com/pgvector/pgvector)
