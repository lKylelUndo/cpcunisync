<?php

namespace App\Http\Services\AcademicRecord;

use App\Http\Repository\AcademicRecordRepository;
use App\Http\Resources\AcademicRecordResource;
use App\Http\Services\Cache\CacheService;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Lists academic records with filters and hand-rolled pagination. */
final class GetAllAcademicRecordService
{
    use ApiResponses;

    public static function GetAllAcademicRecord(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->input('page', 1));
        $perPage = min(50, max(1, (int) $request->input('per_page', 15)));

        $filters = $request->only(['student_id', 'academic_year', 'semester', 'remarks', 'q']);

        $user = $request->user();

        if ($user !== null && $user->role === 'department_head') {
            // Server-side scope always wins over a client-supplied department filter.
            $filters['department_id'] = $user->department_id ?? -1;
        }

        $scope = $user !== null && $user->role === 'department_head'
            ? 'dept:'.($user->department_id ?? -1)
            : 'all';

        $key = 'academic-records:list:'.md5(json_encode([$request->all(), $scope]));

        try {
            $payload = CacheService::remember($key, 300, function () use ($filters, $page, $perPage): array {
                $result = (new AcademicRecordRepository)->search($filters, $page, $perPage);

                $items = $result['items']
                    ->map(fn ($record) => (new AcademicRecordResource($record))->resolve())
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

            return self::success('Academic records retrieved successfully.', $payload);
        } catch (Throwable) {
            return self::error('Unable to retrieve academic records.');
        }
    }
}
