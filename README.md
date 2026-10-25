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
| COE | College of Education | BSEd (Bachelor of Secondary Education), BEEd (Bachelor of Elementary Education) |
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

Only the **admin** account is seeded (password `Password1!`):

| Email | Role |
| --- | --- |
| admin@cpc.edu.ph | admin (verify/reject registrations, full access) |

Staff accounts (`registrar`, `department_head`) are **never seeded** — they self-register:

1. Staff member signs up at `/register` with name, email, password, role (registrar or department head), and optional department.
2. The account is created with status `pending` and cannot log in yet (login returns an "awaiting administrator verification" notice).
3. The admin opens **Registrations** (`/admin/registrations`), reviews pending sign-ups (Pending / Verified / Rejected tabs), and clicks **Verify** or **Reject** (with an optional reason) in `/api/admin/v1/verify-user/{id}` / `reject-user/{id}`.
4. Verified: login issues a Sanctum token immediately. Rejected: login stays blocked and shows the admin's rejection reason.

Registration is limited to `registrar` and `department_head` roles — admin accounts cannot be created through `/register`.

## What's inside

- **Staff registration & verification** — public sign-up (`POST /api/auth/v1/register`) + department/role options (`GET /api/registration/v1/options`); admin review list (`GET /api/admin/v1/all-registrations`) with verify/reject actions; `users.status` (`pending|verified|rejected`) gates login with clear pending/rejected (reason) messages; audits `registered`, `verified_user`, `rejected_user`.
- **Auth/RBAC** — Sanctum personal access tokens; `role:admin,registrar` middleware on writes; department heads read-only.
- **Students / Enrollments / Academic Records** — full CRUD with server-side validation (FormRequests → 422), search, filters, hand-rolled pagination.
- **Integrations** — per-department ETL/REST sync runs (`POST /api/sync/v1/run`, or `php artisan sync:students`), sync history with per-row error payloads, and a REST-push endpoint (`POST /api/integration/v1/students`) with `created|updated|duplicate` outcomes.
- **Duplicate detection** — matchers on student number, email, and name+birthdate; flagged rows become `duplicate_suspect`s; resolve via merge (moves enrollments/records onto the primary) or dismiss.
- **Audit logs** — model observers record created/updated/deleted with old/new values, actor, and IP; auth and registration actions logged too.
- **Reports** — enrollment stats by academic year/semester/program/department, academic summary with pass rates, and sync status.

## API conventions

- Thin controllers (`app/Http/Controllers`) → one-file-per-operation static services (`app/Http/Services/<Domain>/<Action>Service.php`) → repositories (`app/Http/Repository`).
- Flat envelope on HTTP 200: `{ status: "success" | "error", message, data?, source? }`; FormRequest validation failures use Laravel's 422 envelope; unauthenticated 401 / unauthorized 403 are JSON.
- Versioned route groups, e.g. `POST /api/students/v1/create-student` (full map: `routes/api.php`).

Run the client and log in to explore: the dashboard shows the last sync, program/department breakdowns, and duplicate count; **Integrations** replays departmental ETL runs; `/register` + **Registrations** handle the staff sign-up and admin verification workflow.
