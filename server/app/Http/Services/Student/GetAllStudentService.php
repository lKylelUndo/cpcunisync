<?php

namespace App\Http\Services\Student;

use App\Http\Repository\StudentRepository;
use App\Http\Resources\StudentResource;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Lists students with filters and hand-rolled pagination. */
final class GetAllStudentService
{
    use ApiResponses;

    public static function GetAllStudent(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->input('page', 1));
        $perPage = min(50, max(1, (int) $request->input('per_page', 15)));

        $filters = $request->only([
            'q',
            'department_id',
            'program_id',
            'status',
            'year_level',
            'integrity_status',
        ]);

        $user = $request->user();

        if ($user !== null && $user->role === 'department_head') {
            // Server-side scope always wins over a client-supplied department filter.
            $filters['department_id'] = $user->department_id ?? -1;
        }

        try {
            $result = (new StudentRepository)->search($filters, $page, $perPage);

            $items = $result['items']
                ->map(fn ($student) => (new StudentResource($student))->resolve())
                ->values()
                ->all();

            return self::success('Students retrieved successfully.', [
                'items' => $items,
                'page' => $result['page'],
                'per_page' => $result['per_page'],
                'total' => $result['total'],
                'total_pages' => $result['total_pages'],
            ]);
        } catch (Throwable) {
            return self::error('Unable to retrieve students.');
        }
    }
}
