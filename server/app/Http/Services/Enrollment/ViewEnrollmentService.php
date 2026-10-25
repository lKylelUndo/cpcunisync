<?php

namespace App\Http\Services\Enrollment;

use App\Http\Repository\EnrollmentRepository;
use App\Http\Services\Concerns\ApiResponses;
use App\Http\Resources\EnrollmentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/** Returns one enrollment with its student context and academic records. */
final class ViewEnrollmentService
{
    use ApiResponses;

    public static function ViewEnrollment(Request $request, int $id): JsonResponse
    {
        try {
            $enrollment = (new EnrollmentRepository)->findDetailed($id);

            if ($enrollment === null) {
                return self::error('Enrollment not found.', 'notFound');
            }

            return self::success(
                'Enrollment retrieved successfully.',
                (new EnrollmentResource($enrollment))->resolve(),
            );
        } catch (Throwable) {
            return self::error('Unable to retrieve the enrollment.');
        }
    }
}
