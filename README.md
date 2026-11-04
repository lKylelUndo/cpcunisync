# CPC UniSync — Cordova Public College Student Information System

Web-based SIS that centralizes student, enrollment, and academic records from three simulated departmental data sources via **REST API integration** and **ETL sync**, with staff self-registration + admin verification, duplicate detection, RBAC, audit logs, and consolidated reports.

```
cpcunisync/
├── server/   Laravel 13 REST API (clean architecture, MySQL)
└── client/   Next.js 16.4 admin dashboard (axios + shadcn/ui)
```

## Departments & Programs

| Code | Department | Programs |
| --- | --- | --- |
| COE | College of Education | BSEd English (BSEd major in English), BSEd Science (BSEd major in Science), BEEd (Bachelor of Elementary Education) |
| CIT | College of Information Technology | BSIT (Bachelor of Science in Information Technology) |
| CHM | College of Hospitality Management | BSHM (Bachelor of Science in Hospitality Management) |

Simulated departmental source datasets live in `server/database/sources/{education,it,hospitality}.json` and are served publicly at `GET /api/sources/{key}` (intentionally dirty: mixed case names, multiple date formats, messy phones, lowercase program codes, deliberate duplicates).

## Prerequisites

- XAMPP (PHP 8.5 + MySQL) and Composer 2.x — PHP/MySQL on the machine
- Node.js 20+ and npm
- MySQL running on `127.0.0.1:3306` (XAMPP default, root with empty password)

## Backend setup (server/)

```powershell
cd server
php artisan migrate:fresh --seed     # creates schema + seeds users, central records, source datasets
php artisan sync:students --department=education   # ETL run for one source
php artisan sync:students            # ETL run for all sources (also upserts/skips/duplicates)
php artisan serve --host=127.0.0.1 --port=8000
```

`.env` is preconfigured: `DB_DATABASE=cpcunisync`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_USERNAME=root`, `DB_PASSWORD=` (empty), `SOURCE_API_BASE_URL=http://127.0.0.1:8000`.

## Frontend setup (client/)

```powershell
cd client
npm install
npm run dev          # http://localhost:3000
```

`.env.local` already points `NEXT_PUBLIC_BACKEND_URL` at `http://127.0.0.1:8000`.

## Accounts & access

Demo accounts are all seeded (password `Password1!`) — one department head per college:

| Email | Role |
| --- | --- |
| admin@cpc.edu.ph | admin (verify/reject registrations, full access) |
| registrar@cpc.edu.ph | registrar |
| coe-head@cpc.edu.ph | department head — College of Education |
| cit-head@cpc.edu.ph | department head — College of Information Technology |
| chm-head@cpc.edu.ph | department head — College of Hospitality Management |

Additional staff accounts (`registrar`, `department_head`) can self-register:

1. Staff member signs up at `/register` with name, email, password, role (registrar or department head), and optional department.
2. The account is created with status `pending` and cannot log in yet (login returns an "awaiting administrator verification" notice).
3. The admin opens **Registrations** (`/admin/registrations`), reviews pending sign-ups (Pending / Verified / Rejected tabs), and clicks **Verify** or **Reject** (with an optional reason) in `/api/admin/v1/verify-user/{id}` / `reject-user/{id}`.
4. Verified: login issues a Sanctum token immediately. Rejected: login stays blocked and shows the admin's rejection reason.

Registration is limited to `registrar` and `department_head` roles — admin accounts cannot be created through `/register`.

## Features

### Staff registration & admin verification
- Self-service staff sign-up for `registrar` / `department_head` only — admin accounts can never be created from `/register`; role/department options are fetched live via `GET /api/registration/v1/options`.
- Sign-ups start `pending` and are blocked from login with an "awaiting administrator verification" notice.
- Admins review sign-ups in **Registrations** (Pending / Verified / Rejected tabs, status + search filters) and verify or reject with an optional reason — the reason is shown back to the user at login.
- Audits `registered`, `verified_user`, `rejected_user`.

### Auth & RBAC
- Sanctum personal access tokens; the SPA hydrates the session via `auth/me`, injects the bearer token through axios, and auto-logs-out on 401.
- `role:admin,registrar` middleware guards every write route (403 otherwise); department heads are strictly read-only.
- The UI mirrors the matrix: write buttons are role-gated (`canWrite`), the Registrations page is admin-only and hidden from other users' navigation.

### Students / Enrollments / Academic Records
- Full CRUD with server-side validation (FormRequests → 422) and Zod-validated clients, with inline field errors on forms.
- Search (student number / email / name parts) and filters (department, program, year level, status, integrity) with hand-rolled pagination (page/per_page, max 50).
- Student profile view combines enrollment history with all academic records.

### Departmental sources & ETL sync
- Dirty simulated datasets per department, served publicly at `GET /api/sources/{key}` (mixed-case names, multiple date formats, messy phones, lowercase program codes, deliberate duplicates).
- ETL run via `POST /api/sync/v1/run` or `php artisan sync:students --department=education|it|hospitality --method=etl|rest`: normalizes names, emails, phones (`+63`/`09xx` → `0…`), parses multi-format dates, and maps program codes to central IDs.
- Skip-if-identical upsert: existing students update only when the source differs, and empty source fields never overwrite richer central data; malformed rows are recorded in `sync_errors` (failed), never counted as duplicates.
- Sync history with counters (extracted / loaded / updated / skipped / duplicates / failed), filters (department / status / method), and drill-in details that expose per-row error payloads.

### Integration push (REST ingest)
- `POST /api/integration/v1/students` records a sync run per push and answers `created` / `updated` / `duplicate` (HTTP 200 with envelope `{status:"error", source:"duplicate"}` containing the suspect plus ranked candidates) / `failed` (unresolvable program).

### Duplicate detection & resolution
- Ordered matchers — student number → email → name + birthdate (case-insensitive, date-normalized); suspects are flagged via `students.integrity_status` with a self-referencing `duplicate_of_id`.
- Grouped suspect list showing the match reason; **merge** moves enrollments/academic records onto the primary inside a transaction (rows that already exist for the primary's term/subject stay attached; audits `merged_duplicate`), **dismiss** resets the suspect to clean (audits `dismiss_duplicate`).

### Audit logs
- Model observers log student / enrollment / academic-record creates, updates, and deletes with old vs. new values, actor, and IP address; auth, registration, and duplicate-resolution actions are logged explicitly (passwords are never recorded).
- Queryable list with `action` / `user_id` / `model_type` filters and a detail dialog showing the JSON diff.

### Reports & dashboard
- Enrollment stats: per-academic-year/semester totals with program & department breakdowns and a gender split.
- Academic summary: passed / failed / incomplete / ongoing counts, pass-rate %, and per-program and per-year-level grade averages.
- Sync status: run totals by status, per-department last-run and error summary, and a 7-day recent-error count.
- Dashboard: write-gated stat cards (totals, active share, duplicate suspects, program count), department bars, gender bars, status chips, last-sync + sync-health tiles, and quick links.

### Health & conventions
- `GET /api/health` public liveness check.
- Thin controllers → per-operation services → repositories; flat `{ status, message, data?, source? }` envelope on HTTP 200 (see *API conventions* below).

## API conventions

- Thin controllers (`app/Http/Controllers`) → one-file-per-operation static services (`app/Http/Services/<Domain>/<Action>Service.php`) → repositories (`app/Http/Repository`).
- Flat envelope on HTTP 200: `{ status: "success" | "error", message, data?, source? }`; FormRequest validation failures use Laravel's 422 envelope; unauthenticated 401 / unauthorized 403 are JSON.
- Versioned route groups, e.g. `POST /api/students/v1/create-student` (full map: `routes/api.php`).

Run the client and log in to explore: the dashboard shows the last sync, program/department breakdowns, and duplicate count; **Integrations** replays departmental ETL runs; `/register` + **Registrations** handle the staff sign-up and admin verification workflow.
