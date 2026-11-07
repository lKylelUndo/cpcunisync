<?php

namespace App\Http\Repository;

use App\Models\Enrollment;
use App\Models\Student;
use App\Models\SyncRun;
use Illuminate\Database\Eloquent\Collection;

/** Read-only aggregate queries used by the dashboard. */
class DashboardRepository
{
    public function countStudents(?int $departmentId = null): int
    {
        return Student::query()
            ->when($departmentId !== null, fn ($query) => $query->where('department_id', $departmentId))
            ->count();
    }

    /**
     * @return Collection<int, Student>
     */
    public function allStudents(?int $departmentId = null): Collection
    {
        return Student::query()
            ->with(['department', 'program'])
            ->when($departmentId !== null, fn ($query) => $query->where('department_id', $departmentId))
            ->get();
    }

    public function countActiveEnrollments(?int $departmentId = null): int
    {
        return Enrollment::query()
            ->where('status', 'enrolled')
            ->when(
                $departmentId !== null,
                fn ($query) => $query->whereHas(
                    'student',
                    fn ($query) => $query->where('department_id', $departmentId),
                ),
            )
            ->count();
    }

    public function latestSyncRun(?int $departmentId = null): ?SyncRun
    {
        return SyncRun::query()
            ->with('department')
            ->when($departmentId !== null, fn ($query) => $query->where('department_id', $departmentId))
            ->orderByDesc('id')
            ->first();
    }

    /**
     * @return Collection<int, SyncRun>
     */
    public function allSyncRuns(?int $departmentId = null): Collection
    {
        return SyncRun::query()
            ->when($departmentId !== null, fn ($query) => $query->where('department_id', $departmentId))
            ->get();
    }
}
