<?php

namespace App\Http\Services\Student;

use App\Http\Repository\StudentRepository;
use App\Http\Services\Audit\AuditService;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\StudentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Dismisses a duplicate warning and restores a student's clean integrity state. */
final class DismissStudentService
{
    use ApiResponses;

    public static function DismissStudent(Request $request, int $id): JsonResponse
    {
        try {
            $repository = new StudentRepository;
            $student = $repository->findById($id);

            if ($student === null) {
                return self::error('Student not found.', 'notFound');
            }

            $oldValues = [
                'integrity_status' => $student->integrity_status,
                'duplicate_of_id' => $student->duplicate_of_id,
            ];

            $student = $repository->update($student, [
                'integrity_status' => 'clean',
                'duplicate_of_id' => null,
            ]);

            AuditService::Record(
                'dismiss_duplicate',
                'Student',
                $student->id,
                $oldValues,
                ['integrity_status' => 'clean', 'duplicate_of_id' => null],
                null,
                $request->ip(),
            );

            $student->load(['program.department', 'department']);

            return self::success(
                'Duplicate warning dismissed successfully.',
                (new StudentResource($student))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to dismiss the duplicate warning.');
        }
    }
}
