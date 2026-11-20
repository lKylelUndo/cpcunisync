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

        try {
            $payload = CacheService::remember('duplicates:list:'.$scope, 300, function (): array {
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

                return ['groups' => $groups];
            });

            return self::success('Duplicate suspects retrieved successfully.', $payload);
        } catch (Throwable) {
            return self::error('Unable to retrieve duplicates.');
        }
    }
}
