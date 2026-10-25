<?php

namespace App\Http\Services\Enrollment;

use App\Http\Repository\EnrollmentRepository;
use App\Http\Services\Concerns\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Deletes a term enrollment. */
final class DeleteEnrollmentService
{
    use ApiResponses;

    public static function DeleteEnrollment(Request $request, int $id): JsonResponse
    {
        try {
            $repository = new EnrollmentRepository;
            $enrollment = $repository->findById($id);

            if ($enrollment === null) {
                return self::error('Enrollment not found.', 'notFound');
            }

            $repository->delete($enrollment);

            return self::success('Enrollment deleted successfully.', ['id' => $id]);
        } catch (Throwable) {
            return self::error('Unable to delete the enrollment.');
        }
    }
}
