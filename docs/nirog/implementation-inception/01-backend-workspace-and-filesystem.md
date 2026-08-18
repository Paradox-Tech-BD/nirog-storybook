# Backend Workspace and Filesystem

## 1. Repository shape

`nirog-core` is a private pnpm workspace. Node 24 LTS is the runtime baseline because production applications should use an Active or Maintenance LTS release. [1] pnpm workspaces provide one lockfile and make internal package boundaries explicit through the `workspace:` protocol. [2]

The workspace is intentionally a **modular monolith**, not a collection of independently deployable microservices. The API, outbox dispatcher, migration CLI, and worker images share contracts but have separate entry points and least-privilege workload identities.

```text
nirog-core/
├── apps/
│   ├── api/                         # Fastify HTTP and internal-command server
│   ├── dispatcher/                  # Outbox-to-SQS publisher; no HTTP listener
│   └── migrator/                    # One-shot guarded migration entry point
├── packages/
│   ├── contracts/                   # Versioned event/internal-command/response contracts
│   ├── db/                          # Drizzle schema, migration configuration, RLS helpers
│   ├── kernel/                      # Result, problem, ids, clocks, hash, safe logging
│   ├── config/                      # Typed env/configuration schema and validation
│   ├── access/                      # ActorContext, capability, RBAC/PBAC evaluator interfaces
│   ├── queue/                       # Envelope, SQS adapter, consumer-ledger utilities
│   └── testkit/                     # Fixtures, builders, containers, auth test helpers
├── workers/
│   └── ml/                          # Python 3.13 image, pyproject, message consumers
├── infra/
│   ├── docker/                      # Compose, init scripts, local development profiles
│   ├── opentofu/                    # Later: production platform modules
│   └── policy/                      # OPA/Cedar evaluation experiments only when enabled
├── docs/                            # Runbooks, ADRs, API change policy, threat-model references
├── scripts/                         # Non-production setup and verification scripts
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── package.json
├── tsconfig.base.json
└── compose.yaml
```

`workers/ml` is versioned with the core because event and internal-command contracts must evolve atomically. It is not linked as a pnpm package and it becomes a separate Docker image/task at deployment. This is a deployment boundary, not a second clinical system.

## 2. API modular layout

Every Nirog business module has the same narrow dependency direction. Modules may depend on `kernel`, `contracts`, `access`, and public ports of other modules; they must not import another module’s Drizzle table implementation or reach through a controller/service to mutate its data.

```text
apps/api/src/
├── bootstrap/
│   ├── build-server.ts              # Plugin registration and composition root
│   ├── register-routes.ts
│   └── register-observability.ts
├── http/
│   ├── plugins/                     # correlation, auth, actor context, problem handling
│   └── internal/                    # workload-only routes; isolated prefix and auth
├── modules/
│   ├── identity/
│   │   ├── domain/                  # invariants, typed values, permission registry
│   │   ├── application/             # commands, handlers, ports, transactions
│   │   ├── infrastructure/          # Drizzle repositories, OIDC adapter, outbox adapter
│   │   └── http/                    # TypeBox route schemas, route registration, presenters
│   ├── catalog/
│   ├── prescription/
│   ├── regimen/
│   ├── adherence/
│   ├── notification/
│   ├── ai-usage/
│   └── platform/
└── main.ts
```

The `http` layer parses an already declared schema and converts transport input into an application command. Application handlers own transaction boundaries, authorization request construction, idempotency, aggregate state checks, audit, and outbox staging. Infrastructure implements ports; it cannot create new business rules. Domain types do not import Fastify, Drizzle, SQS, or Strapi.

## 3. Composition and dependency rules

The composition root creates factories such as `createIdentityService(deps)` and `createAccessService(deps)`. A module receives interfaces rather than global state. This follows the useful Strapi principle of dependency injection while avoiding its global service container as an authority inside the clinical core. [3]

| Rule | Required practice | Disallowed practice |
|---|---|---|
| Module ownership | A module owns its commands, tables, outbox events, and invariant tests. | Cross-module table writes or shared mutable “business utils.” |
| IDs and time | `AccountId`, `ProfileId`, `DocumentId`, `Clock`, and `CorrelationId` are typed values. | Bare strings passed across module boundaries without validation. |
| Database access | Application handler opens one tenant context transaction and uses module repositories. | `db` imported directly into HTTP handlers or worker loops. |
| Error handling | Typed problems map to a stable non-leaking response envelope. | SQL, provider, stack, or permission details returned to Flutter. |
| Events | Public versioned event contracts live in `packages/contracts`. | Ad-hoc JSON bodies or event consumers reading producer tables. |

## 4. Strapi administration repository

`nirog-strapi-admin` is a separate, private Strapi application created from a released Strapi version. It has a small `src/plugins/nirog-admin` plugin and, only when needed, documented extensions under `src/extensions`. Its own repository applies the relevant Strapi contributor guidance: pnpm, current TypeScript, conventional commits, linting, formatting, and layered tests. It must not be nested inside `nirog-core` because it has a different package manager, upgrade lifecycle, database, identity population, and deployment security boundary.

## 5. Initial commands

| Command | Outcome |
|---|---|
| `pnpm bootstrap` | Checks Node/pnpm versions, creates local configuration, starts dependencies, and waits for health checks. |
| `pnpm dev` | Starts API in watch mode against local PostgreSQL/LocalStack. |
| `pnpm worker:dispatcher` | Runs the outbox dispatcher with its restricted database role. |
| `pnpm db:generate` | Generates reviewable Drizzle SQL migration files. |
| `pnpm db:migrate` | Runs the guarded migrator with the migrator role only. |
| `pnpm openapi:write` | Produces the canonical OpenAPI JSON snapshot. |
| `pnpm verify` | Runs format, lint, types, architecture, unit, integration, and contract tests. |

## References

[1] [Node.js releases](https://nodejs.org/en/about/previous-releases)

[2] [pnpm workspaces](https://pnpm.io/workspaces)

[3] [Strapi upstream engineering guide](https://github.com/strapi/strapi/blob/develop/AGENTS.md)
