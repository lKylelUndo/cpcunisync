<?php

namespace App\Http\Services\Student;

use App\Http\Repository\StudentRepository;
use App\Http\Resources\StudentResource;
use App\Http\Services\Cache\CacheService;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Returns one student with enrollments, records and relationships. */
final class ViewStudentService
{
    use ApiResponses;

    public static function ViewStudent(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $scope = $user !== null && $user->role === 'department_head'
            ? 'dept:'.($user->department_id ?? -1)
            : 'all';

        try {
            $payload = CacheService::remember('students:detail:'.$id.':'.$scope, 300, function () use ($id): ?array {
                $student = (new StudentRepository)->findDetailed($id);

                return $student === null
                    ? null
                    : (new StudentResource($student))->resolve();
            });
        } catch (Throwable) {
            return self::error('Unable to retrieve the student.');
        }

        if ($payload === null) {
            return self::error('Student not found.', 'notFound');
        }

        if ($user !== null
            && $user->role === 'department_head'
            && (int) $payload['department_id'] !== (int) $user->department_id) {
            abort(403, 'This action is unauthorized.');
        }

        return self::success('Student retrieved successfully.', $payload);
    }
}
