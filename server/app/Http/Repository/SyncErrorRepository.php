<?php

namespace App\Http\Repository;

use App\Models\SyncError;

/** Stateless query layer for row-level sync errors. */
class SyncErrorRepository
{
    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): SyncError
    {
        return SyncError::query()->create($attributes);
    }

    public function countSince(\DateTimeInterface $since): int
    {
        return SyncError::query()->where('created_at', '>=', $since)->count();
    }
}
