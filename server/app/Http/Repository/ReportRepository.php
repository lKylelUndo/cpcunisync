<?php

namespace App\Http\Repository;

use App\Models\AcademicRecord;
use App\Models\Enrollment;
use App\Models\SyncRun;
use Illuminate\Database\Eloquent\Collection;

/** Read-only data sources for reporting aggregations. */
class ReportRepository
{
    /**
     * @return Collection<int, Enrollment>
     */
    public function enrollmentsWithStudentContext(): Collection
    {
        return Enrollment::query()
            ->with(['student.program.department', 'student.department'])
            ->get();
    }

    /**
     * @return Collection<int, AcademicRecord>
     */
    public function academicRecordsWithStudentContext(): Collection
    {
        return AcademicRecord::query()
            ->with(['student.program'])
            ->get();
    }

    /**
     * @return Collection<int, SyncRun>
     */
    public function syncRunsWithDepartmentAndErrorCount(): Collection
    {
        return SyncRun::query()
            ->with('department')
            ->withCount('syncErrors')
            ->orderByDesc('id')
            ->get();
    }
}
