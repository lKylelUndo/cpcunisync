<?php

namespace App\Http\Services\Lookup;

use App\Http\Repository\ProgramRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Returns programs with counts and their parent department. */
final class GetAllProgramService
{
    use ApiResponses;

    public static function GetAllProgram(Request $request): JsonResponse
    {
        try {
            $programs = (new ProgramRepository)->allWithCounts()
                ->map(fn ($program) => [
                    'id' => $program->id,
                    'code' => $program->code,
                    'name' => $program->name,
                    'department_id' => $program->department_id,
                    'students_count' => (int) $program->students_count,
                    'department' => $program->department === null ? null : [
                        'id' => $program->department->id,
                        'code' => $program->department->code,
                        'name' => $program->department->name,
                    ],
                ])
                ->values()
                ->all();

            return self::success('Programs retrieved successfully.', $programs);
        } catch (Throwable) {
            return self::error('Unable to retrieve programs.');
        }
    }
}
