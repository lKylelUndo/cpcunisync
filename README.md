# CPC UniSync — Cordova Public College Student Information System

Web-based SIS that centralizes student, enrollment, and academic records from three simulated departmental data sources via **REST API integration** and **ETL sync**, with staff self-registration + admin verification, duplicate detection, RBAC, audit logs, and consolidated reports.

## Overview

Cordova Public College (CPC) runs three colleges — **COE** (Education), **CIT** (Information Technology), and **CHM** (Hospitality Management) — and each one keeps its own student records in its own format. CPC UniSync ingests departmental datasets two ways — **ETL sync** (normalise, dedupe, upsert) and **REST push** (real-time API integration) — and wraps them in people workflows: staff self-register, an administrator verifies them, every write is captured in an audit trail, and department heads see only their own data.

```
 Departmental sources (dirty data)                 Central SIS
 ┌────────────────────────────┐    ETL sync     ┌───────────────────────────┐
 │ education.json   (COE)     │ ──────────────▶ │  Laravel 13 REST API      │
 │ it.json          (CIT)     │  normalize +    │  └─ MySQL (central DB)    │
 │ hospitality.json (CHM)     │  dedupe +       └────────────┬──────────────┘
 └────────────────────────────┘  upsert                      │ REST (axios + Sanctum token)
                                                             ▼
 External systems ─── REST push ────────────────▶  Next.js 16.4 admin SPA
 POST /api/integration/v1/students                 (admin / registrar / dept heads)
```

## Documentation

All detailed docs live in [`docs/`](docs/README.md):

| Document | What's inside |
| --- | --- |
| [docs/getting-started.md](docs/getting-started.md) | Prerequisites, backend/frontend setup, demo accounts, the registration & verification flow |
| [docs/architecture.md](docs/architecture.md) | Data flow, roles & permissions, tech stack, departments & programs, API conventions |
| [docs/features.md](docs/features.md) | Full feature catalogue: registration, RBAC, CRUD modules, ETL sync, duplicate resolution, audit logs, reports & dashboard |
| [docs/edm-principles.md](docs/edm-principles.md) | Course mapping — Integration, Governance, DQM, benefits realized, scope vs the Education/University case |
| [docs/deployment.md](docs/deployment.md) | Deploying to Render (free tier) with Aiven MySQL: Dockerfile, environment variables, verification, caveats |

## Quick start

```powershell
cd server; php artisan migrate:fresh --seed; php artisan sync:students; php artisan serve --port=8000
cd client; npm install; npm run dev
```

Then open http://localhost:3000 and log in as `admin@cpc.edu.ph` (password `Password1!`) — see [docs/getting-started.md](docs/getting-started.md) for demo accounts and deployment to Render + Aiven.
