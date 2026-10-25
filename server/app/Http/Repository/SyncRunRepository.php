<?php

namespace App\Http\Repository;

use App\Models\SyncRun;
use Illuminate\Database\Eloquent\Collection;

/** Stateless query layer for synchronisation runs. */
class SyncRunRepository
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): SyncRun
    {
        return SyncRun::query()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(SyncRun $run, array $attributes): SyncRun
    {
        $run->fill($attributes);
        $run->save();

        return $run->refresh();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{items: Collection<int, SyncRun>, page: int, per_page: int, total: int, total_pages: int}
     */
    public function search(array $filters, int $page, int $perPage): array
    {
        $query = SyncRun::query()
            ->with('department')
            ->withCount('syncErrors');

        if (! empty($filters['department_code'])) {
            $query->whereHas('department', fn ($query) => $query->where('code', $filters['department_code']));
        }

        foreach (['status', 'method'] as $filter) {
            if (! empty($filters[$filter])) {
                $query->where($filter, (string) $filters[$filter]);
            }
        }

        $paginator = $query->orderByDesc('id')->paginate($perPage, ['*'], 'page', $page);

        return [
            'items' => $paginator->getCollection(),
            'page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'total_pages' => $paginator->lastPage(),
        ];
    }

    public function findById(int $id): ?SyncRun
    {
        return SyncRun::query()->with('department')->find($id);
    }

    public function findDetailed(int $id): ?SyncRun
    {
        return SyncRun::query()
            ->with(['department', 'syncErrors'])
            ->find($id);
    }

    public function latestWithDepartment(): ?SyncRun
    {
        return SyncRun::query()
            ->with('department')
            ->orderByDesc('id')
            ->first();
    }

    /**
     * @return Collection<int, SyncRun>
     */
    public function allWithDepartmentAndErrorCount(): Collection
    {
        return SyncRun::query()
            ->with('department')
            ->withCount('syncErrors')
            ->orderByDesc('id')
            ->get();
    }
}
