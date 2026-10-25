<?php

namespace App\Http\Repository;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Collection;

/** Stateless query layer for audit logs. */
class AuditLogRepository
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array{items: Collection<int, AuditLog>, page: int, per_page: int, total: int, total_pages: int}
     */
    public function search(array $filters, int $page, int $perPage): array
    {
        $query = AuditLog::query()->with('user');

        if (! empty($filters['action'])) {
            $query->where('action', (string) $filters['action']);
        }

        if (! empty($filters['user_id'])) {
            $query->where('user_id', (int) $filters['user_id']);
        }

        if (! empty($filters['model_type'])) {
            $query->where('model_type', (string) $filters['model_type']);
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

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): AuditLog
    {
        return AuditLog::query()->create($attributes);
    }
}
