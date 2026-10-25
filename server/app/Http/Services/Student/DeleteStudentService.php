<?php

namespace App\Http\Services\Student;

use App\Http\Repository\StudentRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Deletes a student and cascades dependent enrollment records. */
final class DeleteStudentService
{
    use ApiResponses;

    public static function DeleteStudent(Request $request, int $id): JsonResponse
    {
        try {
            $repository = new StudentRepository;
            $student = $repository->findById($id);

            if ($student === null) {
                return self::error('Student not found.', 'notFound');
            }

            $repository->delete($student);

            return self::success('Student deleted successfully.', ['id' => $id]);
        } catch (Throwable) {
            return self::error('Unable to delete the student.');
        }
    }
}
