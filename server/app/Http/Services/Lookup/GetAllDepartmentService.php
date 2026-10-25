<?php

namespace App\Http\Services\Lookup;

use App\Http\Repository\DepartmentRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Returns departments with program and student counts. */
final class GetAllDepartmentService
{
    use ApiResponses;

    public static function GetAllDepartment(Request $request): JsonResponse
    {
        try {
            $departments = (new DepartmentRepository)->allWithCounts()
                ->map(fn ($department) => [
                    'id' => $department->id,
                    'code' => $department->code,
                    'name' => $department->name,
                    'programs_count' => (int) $department->programs_count,
                    'students_count' => (int) $department->students_count,
                ])
                ->values()
                ->all();

            return self::success('Departments retrieved successfully.', $departments);
        } catch (Throwable) {
            return self::error('Unable to retrieve departments.');
        }
    }
}
