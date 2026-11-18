# Getting started

## Prerequisites

- PHP 8.5 + Composer 2.x, with one of:
  - **Cloud (default `.env`)**: the Aiven MySQL 8.4 service (`defaultdb`, TLS) — no local MySQL required, or
  - **Local**: XAMPP (PHP + MySQL/MariaDB) on `127.0.0.1:3306` (root, empty password) — start it with `C:\xampp\mysql_start.bat` if it is not listening
- Node.js 20+ and npm

## Backend setup (server/)

```powershell
cd server
php artisan migrate:fresh --seed     # creates schema + seeds demo data (seed is idempotent — safe to re-run)
php artisan sync:students --department=education   # ETL run for one source
php artisan sync:students            # ETL run for all sources (also upserts/skips/duplicates)
php artisan serve --host=127.0.0.1 --port=8000
```

`.env` carries two database blocks. The **Aiven** block (TLS to `defaultdb`, see [deployment.md](deployment.md)) is active by default — no local MySQL is needed. The **XAMPP** block (`DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=cpcunisync`, `DB_USERNAME=root`, `DB_PASSWORD=`, `SOURCE_API_BASE_URL=http://127.0.0.1:8000`) is commented and ready: swap the comment markers to run fully offline. `CORS_ALLOWED_ORIGINS` is preconfigured to `http://localhost:3000,http://127.0.0.1:3000,https://cpcunisync.vercel.app`.

## Frontend setup (client/)

```powershell
cd client
npm install
npm run dev          # http://localhost:3000
```

`.env.local` already points `NEXT_PUBLIC_BACKEND_URL` at `https://cpcunisync.onrender.com` (the deployed Render API). To develop against a local API instead, set it to `http://127.0.0.1:8000` and run `php artisan serve` (requires MySQL running).

## Accounts & access

Demo accounts are all seeded (password `Password1!`) — one department head per college, plus a pending demo registration:

| Email | Role |
| --- | --- |
| admin@cpc.edu.ph | admin (verify/reject registrations, full access) |
| registrar@cpc.edu.ph | registrar |
| coe-head@cpc.edu.ph | department head — College of Education |
| cit-head@cpc.edu.ph | department head — College of Information Technology |
| chm-head@cpc.edu.ph | department head — College of Hospitality Management |
| pending-head@cpc.edu.ph | department head (CIT) — seeded as **pending**; verify it from Registrations to demo the approval flow |

Additional staff accounts (`registrar`, `department_head`) can self-register:

1. Staff member signs up at `/register` with name, email, password, role (registrar or department head), and optional department.
2. The account is created with status `pending` and cannot log in yet (login returns an "awaiting administrator verification" notice).
3. The admin opens **Registrations** (`/{workspace}/registrations` — e.g. `/admin/registrations`), reviews pending sign-ups (Pending / Verified / Rejected tabs), and clicks **Verify** or **Reject** (with an optional reason) in `/api/admin/v1/verify-user/{id}` / `reject-user/{id}`.
4. Verified: login issues a Sanctum token immediately. Rejected: login stays blocked and shows the admin's rejection reason.

Registration is limited to `registrar` and `department_head` roles — admin accounts cannot be created through `/register`.
