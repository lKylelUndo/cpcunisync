<?php

namespace Database\Seeders;

use App\Models\AcademicRecord;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\SyncError;
use App\Models\SyncRun;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/** Seeds demonstration audit-log and synchronisation history. Both sections skip themselves once populated, so re-running never doubles up. */
class DemoActivitySeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAuditLogs();
        $this->seedSyncHistory();
    }

    private function seedAuditLogs(): void
    {
        if (AuditLog::query()->count() > 0) {
            return;
        }

        $admin = User::query()->where('email', 'admin@cpc.edu.ph')->firstOrFail();
        $registrar = User::query()->where('email', 'registrar@cpc.edu.ph')->firstOrFail();

        $student = Student::query()->where('student_number', '2025-BSIT-0001')->firstOrFail();
        $enrollment = Enrollment::query()
            ->where('student_id', $student->id)
            ->where('academic_year', '2025-2026')
            ->where('semester', '1st')
            ->firstOrFail();
        $record = AcademicRecord::query()
            ->where('student_id', $student->id)
            ->where('subject_code', 'ITE201')
            ->firstOrFail();

        $rows = [
            ['2026-10-28 08:15:00', 'login', null, null, null, ['guard' => 'web'], $registrar->id],
            ['2026-10-28 08:16:00', 'login', null, null, null, ['guard' => 'web'], $admin->id],
            ['2026-10-29 09:02:00', 'created', 'Student', $student->id, null, [
                'student_number' => $student->student_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'program_code' => 'BSIT',
            ], $admin->id],
            ['2026-10-29 09:03:00', 'created', 'Enrollment', $enrollment->id, null, [
                'student_id' => $student->id,
                'academic_year' => '2025-2026',
                'semester' => '1st',
                'status' => 'enrolled',
            ], $admin->id],
            ['2026-10-30 10:31:00', 'created', 'AcademicRecord', $record->id, null, [
                'student_id' => $student->id,
                'subject_code' => 'ITE201',
                'subject_name' => 'Data Structures',
                'grade' => 91,
                'remarks' => 'passed',
            ], $registrar->id],
            ['2026-11-04 14:05:00', 'login', null, null, null, ['guard' => 'web'], $admin->id],
        ];

        foreach ($rows as [$createdAt, $action, $modelType, $modelId, $oldValues, $newValues, $actorId]) {
            $log = AuditLog::create([
                'user_id' => $actorId,
                'action' => $action,
                'model_type' => $modelType,
                'model_id' => $modelId,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'ip_address' => '127.0.0.1',
            ]);

            DB::table('audit_logs')
                ->where('id', $log->id)
                ->update(['created_at' => $createdAt]);
        }
    }

    private function seedSyncHistory(): void
    {
        if (SyncRun::query()->count() > 0) {
            return;
        }

        $coe = Department::query()->where('code', 'COE')->firstOrFail();
        $cit = Department::query()->where('code', 'CIT')->firstOrFail();

        $runs = [
            ['2026-10-26 07:30:00', '2026-10-26 07:31:12', 'etl', 'success', 36, 32, 0, 0, 4, 0, null,
                'Departmental ETL sync completed for COE, CIT and CHM.'],
            ['2026-10-30 08:05:00', '2026-10-30 08:06:03', 'etl', 'partial', 12, 9, 0, 2, 1, 1, $coe->id,
                'ETL completed with 1 row rejected in the education source.'],
            ['2026-11-02 13:40:00', '2026-11-02 13:40:18', 'rest', 'partial', 4, 2, 1, 0, 0, 1, $cit->id,
                'REST push: 3 of 4 records accepted; 1 rejected — unknown program code.'],
            ['2026-11-05 09:12:00', '2026-11-05 09:12:07', 'etl', 'failed', 36, 0, 0, 0, 0, 0, null,
                'Hospitality source could not be read (HTTP 503); no records were loaded.'],
        ];

        foreach ($runs as [$start, $finish, $method, $status, $extracted, $loaded, $updated, $skipped, $duplicates, $failed, $departmentId, $message]) {
            $run = SyncRun::create([
                'department_id' => $departmentId,
                'method' => $method,
                'status' => $status,
                'extracted' => $extracted,
                'loaded' => $loaded,
                'updated' => $updated,
                'skipped' => $skipped,
                'duplicates' => $duplicates,
                'failed' => $failed,
                'message' => $message,
                'started_at' => $start,
                'finished_at' => $finish,
            ]);

            DB::table('sync_runs')
                ->where('id', $run->id)
                ->update(['created_at' => $start, 'updated_at' => $finish]);
        }

        $partialEtl = SyncRun::query()
            ->where('status', 'partial')
            ->where('method', 'etl')
            ->firstOrFail();

        SyncError::create([
            'sync_run_id' => $partialEtl->id,
            'row_identifier' => 'EDU-2025-0004',
            'message' => 'birth_date "08-19-2002" could not be parsed as a valid date.',
            'payload' => ['student_number' => 'EDU-2025-0004', 'birth_date' => '08-19-2002', 'source' => 'education'],
        ]);

        $partialRest = SyncRun::query()
            ->where('status', 'partial')
            ->where('method', 'rest')
            ->firstOrFail();

        SyncError::create([
            'sync_run_id' => $partialRest->id,
            'row_identifier' => 'IT-2025-9999',
            'message' => 'program_code "BSME" does not map to any central program.',
            'payload' => ['student_number' => 'IT-2025-9999', 'program_code' => 'BSME', 'source' => 'rest-push'],
        ]);
    }
}
