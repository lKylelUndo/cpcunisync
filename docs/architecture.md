# Architecture

Cordova Public College (CPC) runs three colleges — **COE** (Education), **CIT** (Information Technology), and **CHM** (Hospitality Management) — and each one keeps its own student records in its own format. The registrar's office needs a single source of truth, but departmental data is messy: inconsistent name casing, mixed date formats, unstandardized phone numbers, and the same student entered twice.

**CPC UniSync** solves this with a central SIS that ingests departmental datasets two ways:

1. **ETL sync** — each department exposes a simulated dataset (served by the API itself, deliberately dirty). The sync engine extracts it, normalizes names/emails/phones/dates, maps departmental program codes to central programs, then upserts: identical rows are skipped, changed rows are updated, malformed rows land in `sync_errors`, and rows that look like students already in the system are flagged as duplicate suspects instead of being merged blindly.
2. **REST push** — external systems POST students straight to the integration endpoint and get a definitive answer back: `created`, `updated`, `duplicate` (with ranked candidates), or `failed`.

On top of the data layer sit the people workflows: staff sign up themselves, an administrator verifies them before they can log in, and verified accounts can be suspended, reinstated, or deleted. Every write — student CRUD, sync runs, registrations, duplicate resolution — is captured in an audit log with old-vs-new values and the acting user.

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

## Who uses it

| Role | What they can do |
| --- | --- |
| **Admin** | Everything: verify/reject/suspend/reinstate/delete staff registrations, full student CRUD, run syncs, merge/dismiss duplicates, view audit logs and reports. |
| **Registrar** | Run the office day-to-day: full student/enrollment/academic-record CRUD, ETL runs, integration pushes, reports, and dashboards. No access to the Registrations page. |
| **Department head** | Strictly read-only: browse students, enrollments, records, sources, and reports for reference — scoped to their own department's data only. Every write route returns 403. |

## Architecture & tech stack

| Layer | Stack | Notes |
| --- | --- | --- |
| API (`server/`) | Laravel 13, PHP 8.5, MySQL, Sanctum | Clean architecture: thin controllers → per-operation services → repositories; flat JSON envelope on HTTP 200; centralized JSON exception rendering (401/403/404/500). |
| Frontend (`client/`) | Next.js 16.4 (React 19), axios, shadcn/ui, Zod | SPA dashboard behind an `AuthGuard`; axios injects the Sanctum token and auto-logs-out on 401; forms are Zod-validated with inline server errors. |
| Cache (`server/`) | Upstash Redis (via Predis) | 5-minute read caching of registration options, dashboard aggregates, and registration lists; optional locally (database cache), with DB fallback on cache errors. |

## Departments & programs

| Code | Department | Programs |
| --- | --- | --- |
| COE | College of Education | BSEd English (BSEd major in English), BSEd Science (BSEd major in Science), BEEd (Bachelor of Elementary Education) |
| CIT | College of Information Technology | BSIT (Bachelor of Science in Information Technology) |
| CHM | College of Hospitality Management | BSHM (Bachelor of Science in Hospitality Management) |

Simulated departmental source datasets live in `server/database/sources/{education,it,hospitality}.json` and are served publicly at `GET /api/sources/{key}` (intentionally dirty: mixed case names, multiple date formats, messy phones, lowercase program codes, deliberate duplicates).

## API conventions

- Thin controllers (`app/Http/Controllers`) → one-file-per-operation static services (`app/Http/Services/<Domain>/<Action>Service.php`) → repositories (`app/Http/Repository`).
- Flat envelope on HTTP 200: `{ status: "success" | "error", message, data?, source? }`; FormRequest validation failures use Laravel's 422 envelope; unauthenticated 401 / unauthorized 403 are JSON.
- Versioned route groups, e.g. `POST /api/students/v1/create-student` (full map: `routes/api.php`).
- `GET /api/health` — public liveness check.

## Caching (Upstash Redis)

- Optional at deploy time via env only: `CACHE_STORE=redis`, `REDIS_URL` (Upstash `rediss://` DSN), `REDIS_CLIENT=predis`, `REDIS_CACHE_DB=0`. Local dev keeps `CACHE_STORE=database` and needs no Redis.
- `CacheService` wraps Laravel's cache with namespaced, versioned keys (`cpc:<name>:v<version>`), a 5-minute TTL, DB fallback on any cache error, and best-effort global invalidation (bump `cpc:cache:version`) after staff-account writes and successful sync runs.
- Cached reads: registration options, role/department-scoped dashboard aggregates, paginated registration lists. Dashboard keys include the caller's scope so department heads can never see another department's cached data.
