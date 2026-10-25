<?php

namespace App\Http\Services\Audit;

use App\Http\Repository\AuditLogRepository;
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

        try {
            $result = (new AuditLogRepository)->search($filters, $page, $perPage);

            $items = $result['items']
                ->map(fn ($log) => (new AuditLogResource($log))->resolve())
                ->values()
                ->all();

            return self::success('Audit logs retrieved successfully.', [
                'items' => $items,
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'total' => $result['total'],
                'total_pages' => $result['total_pages'],
            ]);
        } catch (Throwable) {
            return self::error('Unable to retrieve audit logs.');
        }
    }
}
