<?php

namespace App\Http\Services\Audit;

use App\Http\Repository\AuditLogRepository;
use App\Http\Services\Cache\CacheService;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\AuditLogResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Lists audit trail entries with filters and author context. */
final class GetAllAuditService
{
    use ApiResponses;

    public static function GetAllAudit(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->input('page', 1));
        $perPage = min(50, max(1, (int) $request->input('per_page', 15)));
        $filters = $request->only(['action', 'user_id', 'model_type']);

        $user = $request->user();

        $scope = $user !== null && $user->role === 'department_head'
            ? 'dept:'.($user->department_id ?? -1)
            : 'all';

        $key = 'audit-logs:list:'.md5(json_encode([$request->all(), $scope]));

        try {
            $payload = CacheService::remember($key, 300, function () use ($filters, $page, $perPage): array {
                $result = (new AuditLogRepository)->search($filters, $page, $perPage);

                $items = $result['items']
                    ->map(fn ($log) => (new AuditLogResource($log))->resolve())
                    ->values()
                    ->all();

                return [
                    'items' => $items,
                    'page' => $result['page'],
                    'per_page' => $result['per_page'],
                    'total' => $result['total'],
                    'total_pages' => $result['total_pages'],
                ];
            });

            return self::success('Audit logs retrieved successfully.', $payload);
        } catch (Throwable) {
            return self::error('Unable to retrieve audit logs.');
        }
    }
}
