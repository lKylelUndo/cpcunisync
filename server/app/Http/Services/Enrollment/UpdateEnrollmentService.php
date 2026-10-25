<?php

namespace App\Http\Services\Enrollment;

use App\Http\Repository\EnrollmentRepository;
use App\Http\Repository\StudentRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\EnrollmentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Updates an enrollment while preserving the composite term uniqueness rule. */
final class UpdateEnrollmentService
{
    use ApiResponses;

    public static function UpdateEnrollment(Request $request, int $id): JsonResponse
    {
        $data = $request->validated();

        try {
            $repository = new EnrollmentRepository;
            $enrollment = $repository->findById($id);

            if ($enrollment === null) {
                return self::error('Enrollment not found.', 'notFound');
            }

            if ((new StudentRepository)->findById((int) $data['student_id']) === null) {
                return self::error('The selected student was not found.', 'notValid');
            }

            $existing = $repository->findForTerm(
                (int) $data['student_id'],
                $data['academic_year'],
                $data['semester'],
            );

            if ($existing !== null && $existing->id !== $enrollment->id) {
                return self::error(
                    'An enrollment already exists for this student and term.',
                    'enrollmentExists',
                );
            }

            if (array_key_exists('status', $data) && $data['status'] === null) {
                unset($data['status']);
            }

            $enrollment = $repository->update($enrollment, $data);
            $enrollment->load(['student.program.department', 'student.department']);

            return self::success(
                'Enrollment updated successfully.',
                (new EnrollmentResource($enrollment))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to update the enrollment.');
        }
    }
}
