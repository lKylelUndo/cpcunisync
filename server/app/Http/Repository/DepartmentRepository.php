<?php

namespace App\Http\Repository;

use App\Models\Department;
use Illuminate\Database\Eloquent\Collection;

/** Stateless query layer for department lookups. */
class DepartmentRepository
{
    /**
     * @return Collection<int, Department>
     */
    public function allWithCounts(): Collection
    {
        return Department::query()
            ->withCount(['programs', 'students'])
            ->orderBy('name')
            ->get();
    }

    public function findByCode(string $code): ?Department
    {
        return Department::query()->where('code', strtoupper(trim($code)))->first();
    }

    /**
     * @return Collection<int, Department>
     */
    public function all(): Collection
    {
        return Department::query()->orderBy('name')->get();
    }
}
