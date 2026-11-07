<?php

namespace App\Http\Services\Student;

use App\Http\Repository\StudentRepository;
use App\Http\Resources\StudentResource;
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
        try {
            $student = (new StudentRepository)->findDetailed($id);
        } catch (Throwable) {
            return self::error('Unable to retrieve the student.');
        }

        if ($student === null) {
            return self::error('Student not found.', 'notFound');
        }

        $user = $request->user();

        if ($user !== null
            && $user->role === 'department_head'
            && (int) $student->department_id !== (int) $user->department_id) {
            abort(403, 'This action is unauthorized.');
        }

        return self::success(
            'Student retrieved successfully.',
            (new StudentResource($student))->resolve(),
        );
    }
}
