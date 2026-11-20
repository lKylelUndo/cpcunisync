# Features

## Staff registration & admin verification
- Self-service staff sign-up for `registrar` / `department_head` only — admin accounts can never be created from `/register`; role/department options are fetched live via `GET /api/registration/v1/options`.
- Sign-ups start `pending` and are blocked from login with an "awaiting administrator verification" notice.
- Admins review sign-ups in **Registrations** (Pending / Verified / Rejected / Suspended tabs, status + search filters) and verify or reject with an optional reason — the reason is shown back to the user at login.
- Verified staff accounts can be managed from the same page: **suspend** (revokes sessions and blocks login until reinstated — amber badge + Suspended tab), **reinstate**, or permanently **delete**. Administrator accounts are protected from all three.
- Audits `registered`, `verified_user`, `rejected_user`, `suspended_user`, `reinstated_user`, `deleted_user`.

## Auth & RBAC
- Sanctum personal access tokens; the SPA hydrates the session via `auth/me`, injects the bearer token through axios, and auto-logs-out on 401.
- `role:registrar` middleware guards every write route (403 otherwise); data reads are `role:registrar,department_head` (403 for admins). Admins are limited to Dashboard, Registrations and Audit Logs; department heads are strictly read-only and scoped to their own department.
- The UI mirrors the matrix: write buttons are role-gated (`canWrite`), the Registrations page is admin-only and hidden from other users' navigation, and data pages are hidden from admins (sidebar + header) with a `NonAdminGuard` redirecting them if they open a data URL directly.

## Students / Enrollments / Academic Records
- Full CRUD with server-side validation (FormRequests → 422) and Zod-validated clients, with inline field errors on forms.
- Search (student number / email / name parts) and filters (department, program, year level, status, integrity) with hand-rolled pagination (page/per_page, max 50).
- Student profile view combines enrollment history with all academic records.

## Departmental sources & ETL sync
- Dirty simulated datasets per department, served publicly at `GET /api/sources/{key}` (mixed-case names, multiple date formats, messy phones, lowercase program codes, deliberate duplicates).
- ETL run via `POST /api/sync/v1/run` or `php artisan sync:students --department=education|it|hospitality --method=etl|rest`: normalizes names, emails, phones (`+63`/`09xx` → `0…`), parses multi-format dates, and maps program codes to central IDs.
- Skip-if-identical upsert: existing students update only when the source differs, and empty source fields never overwrite richer central data; malformed rows are recorded in `sync_errors` (failed), never counted as duplicates.
- Sync history with counters (extracted / loaded / updated / skipped / duplicates / failed), filters (department / status / method), and drill-in details that expose per-row error payloads.

## Integration push (REST ingest)
- `POST /api/integration/v1/students` records a sync run per push and answers `created` / `updated` / `duplicate` (HTTP 200 with envelope `{status:"error", source:"duplicate"}` containing the suspect plus ranked candidates) / `failed` (unresolvable program).

## Duplicate detection & resolution
- Ordered matchers — student number → email → name + birthdate (case-insensitive, date-normalized); suspects are flagged via `students.integrity_status` with a self-referencing `duplicate_of_id`.
- Grouped suspect list showing the match reason; **merge** moves enrollments/academic records onto the primary inside a transaction (rows that already exist for the primary's term/subject stay attached; audits `merged_duplicate`), **dismiss** resets the suspect to clean (audits `dismiss_duplicate`).

## Audit logs
- Model observers log student / enrollment / academic-record creates, updates, and deletes with old vs. new values, actor, and IP address; auth, registration, and duplicate-resolution actions are logged explicitly (passwords are never recorded).
- Queryable list with `action` / `user_id` / `model_type` filters (restricted to admin and registrar) and a detail dialog showing the JSON diff.

## Reports & dashboard
- Enrollment stats: per-academic-year/semester totals with program & department breakdowns and a gender split.
- Academic summary: passed / failed / incomplete / ongoing counts, pass-rate %, and per-program and per-year-level grade averages.
- Sync status: run totals by status, per-department last-run and error summary, and a 7-day recent-error count.
- Dashboard: write-gated stat cards (totals, active share, duplicate suspects, program count), department bars, gender bars, status chips, and last-sync + sync-health tiles.

## Conventions
- `GET /api/health` — public liveness check.
- Thin controllers → per-operation services → repositories; flat `{ status, message, data?, source? }` envelope on HTTP 200 — see [architecture.md](architecture.md#api-conventions) for the full API conventions.
- Optional Upstash Redis caching (5-minute TTL, DB fallback) for registration options, dashboards and registration lists — see [architecture.md](architecture.md#caching-upstash-redis).

Run the client and log in to explore: the dashboard shows the last sync, program/department breakdowns, and duplicate count; **Integrations** replays departmental ETL runs; `/register` + **Registrations** handle the staff sign-up and admin verification workflow.
