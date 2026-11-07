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
    public function enrollmentsWithStudentContext(?int $departmentId = null): Collection
    {
        return Enrollment::query()
            ->with(['student.program.department', 'student.department'])
            ->when(
                $departmentId !== null,
                fn ($query) => $query->whereHas(
                    'student',
                    fn ($query) => $query->where('department_id', $departmentId),
                ),
            )
            ->get();
    }

    /**
     * @return Collection<int, AcademicRecord>
     */
    public function academicRecordsWithStudentContext(?int $departmentId = null): Collection
    {
        return AcademicRecord::query()
            ->with(['student.program'])
            ->when(
                $departmentId !== null,
                fn ($query) => $query->whereHas(
                    'student',
                    fn ($query) => $query->where('department_id', $departmentId),
                ),
            )
            ->get();
    }

    /**
     * @return Collection<int, SyncRun>
     */
    public function syncRunsWithDepartmentAndErrorCount(?int $departmentId = null): Collection
    {
        return SyncRun::query()
            ->with('department')
            ->withCount('syncErrors')
            ->when($departmentId !== null, fn ($query) => $query->where('department_id', $departmentId))
            ->orderByDesc('id')
            ->get();
    }
}
