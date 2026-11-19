# Deploying the API to Render (free tier)

PHP has no native Render runtime — native runtimes are Node/Python/Ruby/Go/Rust/Elixir. The Laravel API therefore deploys as a **Docker** web service, backed by a managed **Aiven MySQL** database. Render runs the app container; it does **not** host the database.

```
Browser (Vercel / local Next.js)
      │ HTTPS, bearer token
      ▼
Render Docker web service         ┌─────────────────────────────┐
server/Dockerfile: PHP 8.5 +     ─┤ Aiven MySQL (MySQL 8.4,     │
artisan serve on $PORT            │ defaultdb, TLS, Singapore)  │
      │                           └─────────────────────────────┘
      └────────────────────────▶  Upstash Redis (TLS, cache)
```

## 1. Create the database (Aiven MySQL)

1. In the [Aiven console](https://console.aivencloud.com): **Create service → MySQL** (Developer-1/free plan is enough — 1 CPU / 1 GB / 8 GB storage).
2. A new service stays in **Building** for a few minutes and its DNS record does not exist until it flips to **Running**. `getaddrinfo ... No such host is known` / `NXDOMAIN` during that window just means the service isn't up yet — wait for **Running**.
3. From **Overview → Connection information**, copy host / port / database / username / password. For this project: host `mysql-c5829ab-….c.aivencloud.com`, port `18540`, database `defaultdb`, user `avnadmin`.
4. The app connects over TLS automatically — plain PDO with mysqlnd upgrades to TLS when the server demands it, no CA certificate is required. (Only set `MYSQL_ATTR_SSL_CA` if you also want to verify Aiven's certificate.)
5. **Free-tier warning:** a powered-off Aiven service is deleted after a grace period, taking its DNS record with it. Leave it running.

## 2. What runs on every container start

`server/Dockerfile` ends with:

```
php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=$PORT
```

- `php artisan migrate --force` — applies pending migrations only; never wipes. Do **not** put `migrate:fresh` here.
- `php artisan db:seed --force` — idempotent demo seed. Everything it creates (lookup data, demo accounts including one pending registration, the 10 central students with enrollments and records, and demonstration audit-log / sync-run history) is only created when missing — re-running it on every redeploy is always safe.
- The ETL **sync is not part of the deploy** — after a fresh database, trigger it once from the **Integrations** page (or `php artisan sync:students`) so the sync history, duplicates queue and dashboards show live data.

## 3. Create the Render web service

1. Push this repository to GitHub (Render deploys from the repo).
2. Render Dashboard → **New → Web Service** → connect the repo.
3. Runtime → **Docker**; **Root Directory** → `server` (build context = the Laravel app; the Dockerfile is at `server/Dockerfile`).
4. Health Check Path → `/api/health`.
5. Under **Environment**, add the variables below — the secrets are `APP_KEY`, `DB_PASSWORD`, and `REDIS_URL` (dashboard only, never committed):

**Environment variables:**

| KEY | VALUE |
| --- | --- |
| `APP_NAME` | `CPC UniSync` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | output of `php artisan key:generate --show` |
| `APP_URL` | `https://<your-service>.onrender.com` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | Aiven host (`….aivencloud.com`) |
| `DB_PORT` | Aiven port |
| `DB_DATABASE` | `defaultdb` |
| `DB_USERNAME` | Aiven username |
| `DB_PASSWORD` | Aiven password — secret, dashboard only |
| `REDIS_URL` | Upstash Redis URL (`rediss://default:<TOKEN>@<endpoint>:6379`) — secret, dashboard only |
| `REDIS_CLIENT` | `predis` |
| `CACHE_STORE` | `redis` |
| `REDIS_CACHE_DB` | `0` — Upstash free tier supports only DB 0 |
| `SESSION_DRIVER` | `database` |
| `QUEUE_CONNECTION` | `database` |
| `SOURCE_API_BASE_URL` | `https://<your-service>.onrender.com` — must be the deployed URL or ETL sync cannot extract the source datasets |
| `CORS_ALLOWED_ORIGINS` | comma-separated browser origins allowed to call the API, e.g. `http://localhost:3000,https://cpcunisync.vercel.app` (parsed by `config/cors.php`; defaults to the localhost pair) |

`PORT` must not be set — Render injects it. Do not commit secrets to the repo.

Redis caching is optional locally: the local `.env` keeps `CACHE_STORE=database`. **On Render, change the existing `CACHE_STORE=database` to `redis`** and add the three `REDIS_*` variables above — leaving it as `database` makes the cache layer write to Aiven's `cache` table instead of Upstash. When Redis is enabled, registration options, dashboards, and registration lists are cached for 5 minutes under namespaced, versioned `cpc:` keys; writes bump a version counter to invalidate them globally. Any Redis failure is caught and the request falls back to the database, so an unavailable cache never breaks a request. Upstash's free tier supports only database `0`, so `REDIS_CACHE_DB` must be `0`.

## 4. Verify after deploy

```powershell
curl https://<your-service>.onrender.com/api/health
# → {"status":"success", …}
curl -X POST https://<your-service>.onrender.com/api/auth/v1/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@cpc.edu.ph","password":"Password1!"}'
# → status success + bearer token
```

**Caveats:**

- Free tier spins down after 15 min idle (~1 min cold start) and gets 750 instance-hours/month. The Aiven MySQL free service must also stay powered on, or the database disappears.
- If the health check or any DB call fails right after deploying, first check the Aiven service is **Running** and the `DB_HOST`/`DB_PORT` match the console exactly.
- CORS origins come from `CORS_ALLOWED_ORIGINS` (comma-separated) — set it in the Render environment to include your client's origin(s), e.g. `https://cpcunisync.vercel.app`, to allow browser calls to the API.
- Verified end-to-end before deployment on Docker 29.5.2 (image build, container start against Aiven `defaultdb`, `/api/health` success, login issuing a token, plus `php artisan sync:students` → 36 extracted / 32 loaded / 4 duplicates). The deployed service was verified with the same health and login requests.
- To use the deployed API from your local client, set `NEXT_PUBLIC_BACKEND_URL=https://<your-service>.onrender.com` in `client/.env.local`.
