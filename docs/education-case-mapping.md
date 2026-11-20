# Education / University case — applied criteria & outputs

The course case row for this industry lists:

| Industry | Data Sources | Integration Methods | Governance Needs | Outputs |
| --- | --- | --- | --- | --- |
| Education / Universities | SIS, LMS, HR, Library, Alumni CRM | ETL/ELT, APIs, Data Fabric | FERPA, GDPR | Unified Student Lifecycle, Academic Analytics |

CPC UniSync implements this case around its central challenge — **siloed academic departments** — and deliberately bounds the rest. Below is an honest cell-by-cell mapping.

## 1. Data sources

| Lesson source | In this project | Status |
| --- | --- | --- |
| **SIS** | Three simulated departmental SIS exports — `education.json` (COE), `it.json` (CIT), `hospitality.json` (CHM) — with deliberately inconsistent casing, dates, phones, program codes and duplicates, plus registrar CSV uploads persisted as source records; the central `students` / `enrollments` / `academic_records` tables hold the loaded result | ✅ Applied (the core of the project) |
| **HR** | Staff accounts: admin / registrar / department heads, self-registration with role + department, admin verification/suspension/deletion, audit attribution by user | ⚠️ Partial — staff identity only, no payroll/HR module |
| **LMS** | — | ❌ Not implemented (no learning-activity source) |
| **Library** | — | ❌ Not implemented |
| **Alumni CRM** | Students can carry `graduated` status; no alumni relationship system | ⚠️ Partial — status only |
| *Challenge: multiple vendors / siloed departments* | Three source formats → one central registry; duplicate suspects flagged, never blindly merged | ✅ Applied end to end |

## 2. Integration methods

| Lesson method | In this project | Status |
| --- | --- | --- |
| **ETL** | `php artisan sync:students` / `POST /api/sync/v1/run` — extract dirty JSON, transform (normalize, date parsing, program mapping), load with skip-if-identical upsert; errors in `sync_errors`; CSV bulk import reuses the same transform/dedupe pipeline | ✅ Applied |
| **APIs** | `POST /api/integration/v1/students` (real-time push with `created/updated/duplicate/failed` answers) and the SPA's own versioned REST API | ✅ Applied |
| **ELT** | — | ❌ Not needed at this scale (small sources, one DB) |
| **Data Fabric / iPaaS** | — | ❌ Not needed; documented as future work for multi-system, no-copy access |

## 3. Governance needs

| Lesson need | In this project | Status |
| --- | --- | --- |
| **FERPA-style secure access + auditability** | RBAC (admin → supervision only; registrar → all data work; heads → read-only and department-scoped), verification-gated accounts, immutable audit log with old/new values, actor and IP, human-readable audit diff dialog | ✅ Applied as the technical foundation |
| **GDPR-style data protection** | Sanctum bearer tokens, TLS in transit (Aiven), passwords never logged, account lifecycle (suspend/reinstate/delete) | ⚠️ Partial foundation — no formal data-subject rights tooling |
| **Formal compliance / certification** | — | ❌ Out of scope for a course build (stated explicitly) |

## 4. Outputs

| Lesson output | In this project | Status |
| --- | --- | --- |
| **Unified Student Lifecycle** | One student profile combining enrollment history, academic records, program/department and status up to `graduated`; central registry across all three colleges; duplicate resolution queue | ⚠️ Partial — enrollment→graduation covered; LMS learning data and alumni stage absent |
| **Academic Analytics** | Enrollment stats (per year/semester, program/department, gender), academic summary (pass rates, grade averages), sync-status report (7-day errors), dashboard breakdowns and sync health | ✅ Applied |

## Concrete outputs produced by the app

- **Central student registry** — searchable/filterable students, enrollments and academic records, with a Student 360° profile per student
- **Integration history** — every ETL/REST run with counters, per-row error payloads and drill-in details
- **Data-quality queue** — grouped duplicate suspects with match reasons, merge/dismiss actions and audit entries
- **Governance evidence** — staff verification workflow, audit trail with readable change diffs, department-scoped access
- **Analytics** — three reports + dashboard aggregates, refreshed from cached reads with write invalidation
- **Bulk onboarding** — CSV template + column validation; uploaded rows are persisted as source data and loaded by an automatic ETL run, with per-row error reporting

## Boundary summary

Applied fully: the SIS-silo problem, ETL and API integration, RBAC/verification/audit trails, student-unification and academic analytics. Applied partially: HR-as-staff-accounts, graduation-only lifecycle, GDPR-style technical protections. Not applied (with documented reasons): LMS, library and alumni CRM sources, ELT, CDC, data virtualization, data fabric/iPaaS, and legal compliance certification. See [edm-principles.md](edm-principles.md) for the detailed course mapping and [etl-sync.md](etl-sync.md) for the ETL walkthrough.
