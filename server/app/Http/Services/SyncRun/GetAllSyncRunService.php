<?php

namespace App\Http\Services\SyncRun;

use App\Http\Repository\SyncRunRepository;
use App\Http\Services\Cache\CacheService;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\SyncRunResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Lists sync runs with filters and error counts. */
final class GetAllSyncRunService
{
    use ApiResponses;

    public static function GetAllSyncRun(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->input('page', 1));
        $perPage = min(50, max(1, (int) $request->input('per_page', 15)));
        $filters = $request->only(['department_code', 'status', 'method']);

        $user = $request->user();

        $scope = $user !== null && $user->role === 'department_head'
            ? 'dept:'.($user->department_id ?? -1)
            : 'all';

        $key = 'sync-runs:list:'.md5(json_encode([$request->all(), $scope]));

        try {
            $payload = CacheService::remember($key, 60, function () use ($filters, $page, $perPage): array {
                $result = (new SyncRunRepository)->search($filters, $page, $perPage);

                $items = $result['items']
                    ->map(fn ($run) => (new SyncRunResource($run))->resolve())
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

            return self::success('Synchronisation runs retrieved successfully.', $payload);
        } catch (Throwable) {
            return self::error('Unable to retrieve synchronisation runs.');
        }
    }
}
