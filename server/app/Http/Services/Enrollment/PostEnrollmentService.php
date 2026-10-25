<?php

namespace App\Http\Services\Enrollment;

use App\Http\Repository\EnrollmentRepository;
use App\Http\Repository\StudentRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\EnrollmentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Creates a term enrollment after checking the composite term guard. */
final class PostEnrollmentService
{
    use ApiResponses;

    public static function PostEnrollment(Request $request): JsonResponse
    {
        $data = $request->validated();

        try {
            $students = new StudentRepository;
            $student = $students->findById((int) $data['student_id']);

            if ($student === null) {
                return self::error('The selected student was not found.', 'notValid');
            }

            $repository = new EnrollmentRepository;
            $existing = $repository->findForTerm(
                (int) $data['student_id'],
                $data['academic_year'],
                $data['semester'],
            );

            if ($existing !== null) {
                return self::error(
                    'An enrollment already exists for this student and term.',
                    'enrollmentExists',
                );
            }

            $data['status'] = $data['status'] ?? 'enrolled';
            $enrollment = $repository->create($data);
            $enrollment->load(['student.program.department', 'student.department']);

            return self::success(
                'Enrollment created successfully.',
                (new EnrollmentResource($enrollment))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to create the enrollment.');
        }
    }
}
