<?php

namespace App\Http\Services\Student;

use App\Http\Repository\StudentRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\StudentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Returns one student with enrollments, records and relationships. */
final class ViewStudentService
{
    use ApiResponses;

    public static function ViewStudent(Request $request, int $id): JsonResponse
    {
        try {
            $student = (new StudentRepository)->findDetailed($id);

            if ($student === null) {
                return self::error('Student not found.', 'notFound');
            }

            return self::success(
                'Student retrieved successfully.',
                (new StudentResource($student))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to retrieve the student.');
        }
    }
}
