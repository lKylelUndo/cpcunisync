# Laravel Application

Laravel 13 REST API with a clean architecture: thin controllers → one-file-per-operation
static services (`app/Http/Services/<Domain>/<Action>Service.php`) → repositories
(`app/Http/Repository`), returning a flat JSON envelope on HTTP 200.

## Environment

- PHP 8.5 + Composer 2.x. `.env` carries two blocks: the **Aiven** block (cloud TLS, database `defaultdb`,
  `….aivencloud.com:18540`) is active by default — no local MySQL required; the **XAMPP** block (local
  MariaDB on `127.0.0.1:3306`, database `cpcunisync`) is commented — swap the comment markers to run fully
  offline, starting MySQL with `C:\xampp\mysql_start.bat`.
- Serve locally: `php artisan serve --host=127.0.0.1 --port=8000` (from this directory).
- Reset data: `php artisan migrate:fresh --seed`, then replay the departmental ETL with
  `php artisan sync:students`. `php artisan db:seed --force` is idempotent — safe to re-run.
- Cloud deploy runs `migrate --force && db:seed --force` on every container start — see
  `docs/deployment.md` in the repository root (never add `migrate:fresh` there).

## Conventions

- Versioned route groups live in `routes/api/*.php` (aggregated by `routes/api.php`);
  the `/api` prefix comes from `bootstrap/app.php`.
- Validation via FormRequests (`app/Http/Requests/**`) → 422; business failures use the
  flat error envelope (`{status: "error", message, source?}`) on HTTP 200.
- Exception rendering is centralized in `bootstrap/app.php` (401/403/404/500 as JSON).
- For direct database checks with the XAMPP block active, use
  `C:\xampp\mysql\bin\mysql.exe -u root cpcunisync -e "..."` instead of tinker quoting.
  (No local equivalent exists for the Aiven block — use `php artisan tinker --execute`.)
