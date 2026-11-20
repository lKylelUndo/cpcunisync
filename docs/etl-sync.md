# How ETL sync works

The Integrations page can run a synchronisation for **one selected department** or for all three simulated department sources. A run extracts a deliberately dirty JSON dataset, examines and cleanses every row, reconciles it against the central student registry, and records counts and per-row errors.

```
Selected source: education.json (COE)   ─┐
                 it.json (CIT)          ─┼─▶ Extract ─▶ Transform ─▶ Validate
                 hospitality.json (CHM) ─┘                              │
                                                                        ▼
                              Duplicates ◀── Reconcile ◀── extracted student payloads
                                   │
                                   ▼
                       sync_runs counters + sync_errors rows
```

Key code: `app/Http/Services/Sync/RunSyncService.php` (orchestration), `app/Http/Services/Sync/EtlService.php` (transform), `app/Http/Repository/SourceRepository.php` (extraction).

## 1. Trigger and run setup

The page sends `POST /api/sync/v1/run` (or `php artisan sync:students`) with a department key and method:

- `education → COE`, `it → CIT`, `hospitality → CHM` (the mapping in `RunSyncService::SOURCE_DEPARTMENTS`)
- method `etl` reads the source from disk; method `rest` fetches it over HTTP

A `sync_runs` row is created with `status: running`, the selected `department_id`, and `started_at`.

## 2. Extract — read the selected source

`SourceRepository::readFile()` reads `server/database/sources/{key}.json` directly from disk and decodes JSON. These files are written by `SourceDataSeeder` and contain deliberately messy data: inconsistent casing, multiple date formats, messy phones, lowercase program codes, and intentional duplicate rows. The same JSON is also exposed publicly at `GET /api/sources/{key}` for inspection.

The payload must contain a `records` array. If the source cannot be read or decoded, one error is logged (`row_identifier: source:{key}`, message "The source could not be read.", with the exception detail in the payload), `failed` is incremented, and the run continues with any other selected sources. Real-time external integration is a separate path: `POST /api/integration/v1/students` (REST push).

## 3. Examine and transform each record

`EtlService::Transform()` normalises the raw row into a central student payload:

| Field | What happens |
| --- | --- |
| program | `program_code` (or `program` / `programCode`) is looked up against central programs → `program_id` + `department_id` |
| names | trimmed and title-cased (` jUan ` → `Juan`) |
| email | trimmed and lowercased |
| phone | punctuation stripped; `+63…` (12 digits) and `09xx` (10 digits) → `0…` |
| sex | `m/male`, `f/female`, `o/other` → canonical values |
| birth date | parsed from `Y-m-d`, `m-d-Y`, `m/d/Y`, `j-n-Y`, `n/j/Y`, then a fallback parse → `Y-m-d` |
| year level | clamped to 1–4 |
| status | mapped to `active / inactive / graduated / dropped` (default `active`) |
| source | tagged with the source key (`education`, `it`, `hospitality`) |

## 4. Validate

Every transformed payload is checked with `StudentRules::rules()` via Laravel's Validator. Invalid rows are written to `sync_errors` with their identifier and the **raw source row** as payload, and increment `failed` — they are never counted as duplicates.

## 5. Reconcile against the central registry

- **Student number already exists** → `EtlService::ChangedValues()` compares non-empty fields. Differing fields produce an update (`updated`); no differences produce `skipped`. Empty source fields **never** overwrite richer central data.
- **New student** → `DuplicateDetectionService::FindCandidates()` checks, in order: **student number → email → name + birthdate** (case-insensitive, date-normalised). A match inserts the row with `integrity_status = duplicate_suspect` and `duplicate_of_id` pointing at the primary (`duplicates`). No match inserts a clean row (`loaded`).

Duplicates are flagged, never merged automatically — the **Duplicates** page is where a human merges or dismisses them.

## 6. Finish and report

Counters are written to `sync_runs`: `extracted`, `loaded`, `updated`, `skipped`, `duplicates`, `failed`. Status is:

- **success** — no failures
- **partial** — some records succeeded, some failed
- **failed** — nothing succeeded

`finished_at` and a human-readable message are set, the cache is invalidated, and the result is returned to the Integrations page. A full run across all three sources typically reports **36 extracted / 32 loaded / 4 duplicates / 0 failed** — the 4 are the intentionally duplicated source rows awaiting review.

## Where to inspect a run

- **Integrations** page — history, counters, filters by department/status/method, and "View run details"
- **Sync errors** — per-row failures with the original source payload, reachable from run details
- **Duplicates** page — flagged suspects with ranked match reasons and merge/dismiss actions
- API: `GET /api/sync/v1/all-runs`, `GET /api/sync/v1/view-run/{id}` (registrar / department head only; heads are scoped to their department)
