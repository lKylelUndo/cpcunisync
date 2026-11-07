# CPC UniSync — Cordova Public College Student Information System

Web-based SIS that centralizes student, enrollment, and academic records from three simulated departmental data sources via **REST API integration** and **ETL sync**, with staff self-registration + admin verification, duplicate detection, RBAC, audit logs, and consolidated reports.

## Overview

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

### Who uses it

| Role | What they can do |
| --- | --- |
| **Admin** | Everything: verify/reject/suspend/reinstate/delete staff registrations, full student CRUD, run syncs, merge/dismiss duplicates, view audit logs and reports. |
| **Registrar** | Run the office day-to-day: full student/enrollment/academic-record CRUD, ETL runs, integration pushes, reports, and dashboards. No access to the Registrations page. |
| **Department head** | Strictly read-only: browse students, enrollments, records, sources, and reports for reference. Every write route returns 403. |

### Architecture & tech stack

| Layer | Stack | Notes |
| --- | --- | --- |
| API (`server/`) | Laravel 13, PHP 8.5, MySQL, Sanctum | Clean architecture: thin controllers → per-operation services → repositories; flat JSON envelope on HTTP 200; centralized JSON exception rendering (401/403/404/500). |
| Frontend (`client/`) | Next.js 16.4 (React 19), axios, shadcn/ui, Zod | SPA dashboard behind an `AuthGuard`; axios injects the Sanctum token and auto-logs-out on 401; forms are Zod-validated with inline server errors. |

## EDM principles applied (course mapping)

This project is a working application of the three Enterprise Data Management core concepts — **Integration**, **Governance**, and **Data Quality Management** — for the **Education / University** industry case (siloed academic departments → unified student records → academic analytics).

### 1. Integration — unify data across departments ✅

| Lesson concept | Status | Where it lives in the project |
| --- | --- | --- |
| **ETL** (batch, transform before load) | Implemented | `POST /api/sync/v1/run` + `php artisan sync:students` — extracts each department's dirty dataset, transforms (name/email/phone normalization, multi-format date parsing, program-code → central-ID mapping), loads into the central MySQL DB with skip-if-identical upsert; malformed rows land in `sync_errors`. |
| **API integration** (real-time connections) | Implemented | `POST /api/integration/v1/students` — external systems push a student and get an immediate `created` / `updated` / `duplicate` (with ranked candidates) / `failed` answer; every push is recorded as its own sync run. |
| **ELT, CDC, data virtualization, data fabric/iPaaS** | Not needed at this scale | Three small simulated sources into one central DB are fully covered by batch ETL + API push. CDC would matter for change-streaming high-volume sources; virtualization/fabric for no-copy access across many systems — both are natural future work. |

### 2. Governance — policies, ownership, accountability ✅

- **Role-based access control**: `admin` (full access), `registrar` (office workflows), `department_head` (strictly read-only) — enforced by `role:admin,registrar` middleware on every write route and mirrored in the UI (write buttons hidden, Registrations page admin-only).
- **Accountability over who may touch data**: staff self-register but start `pending`; an administrator verifies, rejects (with reason), suspends, reinstates, or deletes accounts. Nobody writes student data without an approved, attributed identity — and administrator accounts themselves are protected from suspension/deletion.
- **Audit trails**: every create/update/delete of students, enrollments, and academic records is logged with old-vs-new values, the acting user, and IP address; registration and duplicate-resolution actions are logged explicitly; passwords are never recorded. This is the FERPA-style *secure access + auditability* foundation from the university case (formal legal compliance is out of scope for this build).

### 3. DQM — accuracy, consistency, reliability ✅

- **Duplicate detection**: ordered matchers — student number → email → name + birthdate (case-insensitive, date-normalized) — flag suspects via `students.integrity_status` instead of silently merging.
- **Human-in-the-loop resolution**: **merge** moves enrollments/records onto the primary inside a transaction (audited), **dismiss** resets the suspect to clean (audited).
- **Standardization at entry**: ETL normalizes names, emails, phones, and dates; empty source fields never overwrite richer central data; identical rows are skipped rather than reloaded.
- **Quality monitoring**: sync runs count extracted / loaded / updated / skipped / duplicates / failed; the **Sync status** report tracks per-department last-run, errors, and a 7-day error window.

### EDM benefits realized

| Lesson benefit | How this project shows it |
| --- | --- |
| **Improved analytics** | Consolidated cross-department reports: enrollment stats, academic summary, sync status — plus the dashboard's program/department/gender breakdowns. |
| **Operational efficiency** | Detect-and-resolve duplication, skip-if-identical upserts, and one admin SPA replacing per-department record silos. |
| **Compliance & security** | RBAC, token-based auth, staff verification workflow, full audit trails. (Encryption in transit/at rest is a future item on the local XAMPP setup.) |
| **Student 360° view** | The education-case analog of Customer/Patient 360: one student profile unifying enrollment history + academic records + program/department across all three colleges. |
| **AI readiness** | The clean, deduplicated central store is exactly the reliable input ML would need — no models are implemented; this is the future step. |

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
- Admins review sign-ups in **Registrations** (Pending / Verified / Rejected / Suspended tabs, status + search filters) and verify or reject with an optional reason — the reason is shown back to the user at login.
- Verified staff accounts can be managed from the same page: **suspend** (revokes sessions and blocks login until reinstated — amber badge + Suspended tab), **reinstate**, or permanently **delete**. Administrator accounts are protected from all three.
- Audits `registered`, `verified_user`, `rejected_user`, `suspended_user`, `reinstated_user`, `deleted_user`.

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
