<?php

namespace App\Http\Repository;

use App\Models\Program;
use Illuminate\Database\Eloquent\Collection;

/** Stateless query layer for academic program lookups. */
class ProgramRepository
{
    /**
     * @return Collection<int, Program>
     */
    public function allWithCounts(): Collection
    {
        return Program::query()
            ->with('department')
            ->withCount('students')
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): ?Program
    {
        return Program::query()->with('department')->find($id);
    }

    public function findByIdBasic(int $id): ?Program
    {
        return Program::query()->find($id);
    }

    public function findByCode(string $code): ?Program
    {
        return Program::query()
            ->where('code', trim($code))
            ->first();
    }

    /**
     * @return Collection<int, Program>
     */
    public function all(): Collection
    {
        return Program::query()->with('department')->orderBy('name')->get();
    }
}
