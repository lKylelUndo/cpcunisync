# Laravel Application

Laravel 13 REST API with a clean architecture: thin controllers → one-file-per-operation
static services (`app/Http/Services/<Domain>/<Action>Service.php`) → repositories
(`app/Http/Repository`), returning a flat JSON envelope on HTTP 200.

## Environment

- PHP 8.5 + MySQL via XAMPP (`C:\xampp`), Composer 2.x. MySQL runs on `127.0.0.1:3306`
  (root, empty password) — start it with `C:\xampp\mysql_start.bat` if it is not listening.
- Serve locally: `php artisan serve --host=127.0.0.1 --port=8000` (from this directory).
- Reset data: `php artisan migrate:fresh --seed`, then replay the departmental ETL with
  `php artisan sync:students`.

## Conventions

- Versioned route groups live in `routes/api/*.php` (aggregated by `routes/api.php`);
  the `/api` prefix comes from `bootstrap/app.php`.
- Validation via FormRequests (`app/Http/Requests/**`) → 422; business failures use the
  flat error envelope (`{status: "error", message, source?}`) on HTTP 200.
- Exception rendering is centralized in `bootstrap/app.php` (401/403/404/500 as JSON).
- For direct database checks, use
  `C:\xampp\mysql\bin\mysql.exe -u root cpcunisync -e "..."` instead of tinker quoting.
