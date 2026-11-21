<?php

namespace App\Http\Services\Student;

use App\Http\Repository\StudentRepository;
use App\Http\Services\Cache\CacheService;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\StudentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Lists duplicate suspects together with their chosen primary records. */
final class ViewAllDuplicatesService
{
    use ApiResponses;

    public static function ViewAllDuplicates(Request $request): JsonResponse
    {
        $user = $request->user();

        $scope = $user !== null && $user->role === 'department_head'
            ? 'dept:'.($user->department_id ?? -1)
            : 'all';

        $page = max(1, (int) $request->input('page', 1));
        $perPage = min(50, max(1, (int) $request->input('per_page', 15)));

        try {
            $payload = CacheService::remember(
                'duplicates:list:'.$scope.':page:'.$page.':per_page:'.$perPage,
                300,
                function () use ($page, $perPage): array {
                    $students = (new StudentRepository)->duplicateSuspects();

                    $groups = $students
                        ->filter(fn ($duplicate) => $duplicate->duplicateOf !== null)
                        ->map(function ($duplicate): array {
                            return [
                                'duplicate' => (new StudentResource($duplicate))->resolve(),
                                'primary' => (new StudentResource($duplicate->duplicateOf))->resolve(),
                                'match_reason' => DuplicateDetectionService::MatchReasonBetween(
                                    $duplicate,
                                    $duplicate->duplicateOf,
                                ),
                            ];
                        })
                        ->values()
                        ->all();

                    $total = count($groups);
                    $totalPages = (int) ceil($total / $perPage);
                    $offset = ($page - 1) * $perPage;

                    return [
                        'groups' => array_slice($groups, $offset, $perPage),
                        'total' => $total,
                        'total_pages' => $totalPages,
                    ];
                },
            );

            return self::success('Duplicate suspects retrieved successfully.', [
                'groups' => $payload['groups'],
                'page' => $page,
                'per_page' => $perPage,
                'total' => $payload['total'],
                'total_pages' => $payload['total_pages'],
            ]);
        } catch (Throwable) {
            return self::error('Unable to retrieve duplicates.');
        }
    }
}
