<?php

namespace App\Http\Services\SyncRun;

use App\Http\Repository\SyncRunRepository;
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

        try {
            $result = (new SyncRunRepository)->search($filters, $page, $perPage);

            $items = $result['items']
                ->map(fn ($run) => (new SyncRunResource($run))->resolve())
                ->values()
                ->all();

            return self::success('Synchronisation runs retrieved successfully.', [
                'items' => $items,
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'total' => $result['total'],
                'total_pages' => $result['total_pages'],
            ]);
        } catch (Throwable) {
            return self::error('Unable to retrieve synchronisation runs.');
        }
    }
}
