# Documentation index

Read in this order to understand the project from scratch:

| # | Document | What it covers |
| --- | --- | --- |
| 1 | [getting-started.md](getting-started.md) | Prerequisites, backend/frontend setup, demo accounts, how to register and verify staff |
| 2 | [architecture.md](architecture.md) | What the system is, how data flows (ETL vs REST), roles, architecture & tech stack, API conventions |
| 3 | [features.md](features.md) | Full feature catalogue: registration & verification, RBAC, CRUD modules, ETL sync, integration push, duplicates, audit logs, reports & dashboard |
| 4 | [etl-sync.md](etl-sync.md) | Step-by-step ETL pipeline: extract, transform, validate, reconcile, dedupe, run counters and error rows |
| 5 | [education-case-mapping.md](education-case-mapping.md) | Education/University case criteria: which sources, methods, governance needs and outputs are applied vs out of scope |
| 6 | [edm-principles.md](edm-principles.md) | Course mapping: Integration, Governance, DQM, EDM benefits, scope vs the full Education/University case |
| 7 | [deployment.md](deployment.md) | Deploying the Laravel API to Render (free tier) with Aiven MySQL: Dockerfile, environment variables, verification, caveats |

Other docs in the repository:

- `server/AGENTS.md` / `server/CLAUDE.md` — agent-oriented conventions for the Laravel API (clean architecture, envelope conventions)
