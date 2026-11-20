# EDM principles applied (course mapping)

This project is a working application of the three Enterprise Data Management core concepts — **Integration**, **Governance**, and **Data Quality Management** — for the **Education / University** industry case (siloed academic departments → unified student records → academic analytics).

## 1. Integration — unify data across departments ✅

| Lesson concept | Status | Where it lives in the project |
| --- | --- | --- |
| **ETL** (batch, transform before load) | Implemented | `POST /api/sync/v1/run` + `php artisan sync:students` — extracts each department's dirty dataset, transforms (name/email/phone normalization, multi-format date parsing, program-code → central-ID mapping), loads into the central MySQL DB with skip-if-identical upsert; malformed rows land in `sync_errors`. |
| **API integration** (real-time connections) | Implemented | `POST /api/integration/v1/students` — external systems push a student and get an immediate `created` / `updated` / `duplicate` (with ranked candidates) / `failed` answer; every push is recorded as its own sync run. |
| **ELT, CDC, data virtualization, data fabric/iPaaS** | Not needed at this scale | Three small simulated sources into one central DB are fully covered by batch ETL + API push. CDC would matter for change-streaming high-volume sources; virtualization/fabric for no-copy access across many systems — both are natural future work. |

## 2. Governance — policies, ownership, accountability ✅

- **Role-based access control**: `admin` (system supervision only — dashboard, registrations, audit logs), `registrar` (all office workflows and writes), `department_head` (strictly read-only, own department) — enforced by `role:registrar` on writes, `role:registrar,department_head` on data reads, and `role:admin` on registrations; mirrored in the UI by nav filtering and page guards.
- **Accountability over who may touch data**: staff self-register but start `pending`; an administrator verifies, rejects (with reason), suspends, reinstates, or deletes accounts. Nobody writes student data without an approved, attributed identity — and administrator accounts themselves are protected from suspension/deletion.
- **Audit trails**: every create/update/delete of students, enrollments, and academic records is logged with old-vs-new values, the acting user, and IP address; registration and duplicate-resolution actions are logged explicitly; passwords are never recorded. This is the FERPA-style *secure access + auditability* foundation from the university case (formal legal compliance is out of scope for this build).

## 3. DQM — accuracy, consistency, reliability ✅

- **Duplicate detection**: ordered matchers — student number → email → name + birthdate (case-insensitive, date-normalized) — flag suspects via `students.integrity_status` instead of silently merging.
- **Human-in-the-loop resolution**: **merge** moves enrollments/records onto the primary inside a transaction (audited), **dismiss** resets the suspect to clean (audited).
- **Standardization at entry**: ETL normalizes names, emails, phones, and dates; empty source fields never overwrite richer central data; identical rows are skipped rather than reloaded.
- **Quality monitoring**: sync runs count extracted / loaded / updated / skipped / duplicates / failed; the **Sync status** report tracks per-department last-run, errors, and a 7-day error window.

## EDM benefits realized

| Lesson benefit | How this project shows it |
| --- | --- |
| **Improved analytics** | Consolidated cross-department reports: enrollment stats, academic summary, sync status — plus the dashboard's program/department/gender breakdowns. |
| **Operational efficiency** | Detect-and-resolve duplication, skip-if-identical upserts, and one admin SPA replacing per-department record silos. |
| **Compliance & security** | RBAC, token-based auth, staff verification workflow, full audit trails, TLS in transit (Aiven). (Encryption at rest is future work.) |
| **Student 360° view** | The education-case analog of Customer/Patient 360: one student profile unifying enrollment history + academic records + program/department across all three colleges. |
| **AI readiness** | The clean, deduplicated central store is exactly the reliable input ML would need — no models are implemented; this is the future step. |

## Scope vs the full Education/University case

The lesson offers five industry cases — healthcare, banking, retail, manufacturing, and education/university. This project implements the **Education / University** case, which lists SIS, LMS, HR/payroll, library, and alumni CRM as sources, with a lifecycle goal of enrollment → learning → graduation → alumni under FERPA/GDPR. CPC UniSync deliberately targets the case's core challenge — **siloed academic departments** — and bounds the rest:

- **Sources**: three departmental SIS-style datasets (COE/CIT/CHM) rather than five vendor systems — the siloed-departments problem simulated end-to-end. LMS, HR/payroll, library, and alumni CRM are future integrations that would enter through the same ETL/API entry points.
- **Lifecycle**: enrollment and academic performance through graduation status; learning-activity (LMS) and alumni management are future work.
- **Access**: staff-facing only (admin, registrar, department heads) with verification-gated accounts; a student self-service portal is future work.
- **Compliance**: secure access + full audit trails implemented as the FERPA/GDPR foundation; formal certification is out of scope.
- **Encryption**: passwords hashed, token-based auth; TLS in transit on the Aiven cloud deployment (no TLS on the local XAMPP block — local is untrusted); encryption at rest is future work.
