<?php

namespace App\Http\Services\Student;

use App\Http\Repository\StudentRepository;
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
        try {
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

            return self::success('Duplicate suspects retrieved successfully.', ['groups' => $groups]);
        } catch (Throwable) {
            return self::error('Unable to retrieve duplicates.');
        }
    }
}
