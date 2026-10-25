<?php

namespace App\Http\Repository;

use App\Models\Enrollment;
use App\Models\Student;
use App\Models\SyncRun;
use Illuminate\Database\Eloquent\Collection;

/** Read-only aggregate queries used by the dashboard. */
class DashboardRepository
{
    public function countStudents(): int
    {
        return Student::query()->count();
    }

    /**
     * @return Collection<int, Student>
     */
    public function allStudents(): Collection
    {
        return Student::query()->with(['department', 'program'])->get();
    }

    public function countActiveEnrollments(): int
    {
        return Enrollment::query()->where('status', 'enrolled')->count();
    }

    public function latestSyncRun(): ?SyncRun
    {
        return SyncRun::query()->with('department')->orderByDesc('id')->first();
    }

    /**
     * @return Collection<int, SyncRun>
     */
    public function allSyncRuns(): Collection
    {
        return SyncRun::query()->get();
    }
}
