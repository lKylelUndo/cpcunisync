<?php

namespace App\Http\Services\Enrollment;

use App\Http\Repository\EnrollmentRepository;
use App\Http\Resources\EnrollmentResource;
use App\Http\Services\Concerns\ApiResponses;
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
        } catch (Throwable) {
            return self::error('Unable to retrieve the enrollment.');
        }

        if ($enrollment === null) {
            return self::error('Enrollment not found.', 'notFound');
        }

        $user = $request->user();

        if ($user !== null
            && $user->role === 'department_head'
            && (int) $enrollment->student?->department_id !== (int) $user->department_id) {
            abort(403, 'This action is unauthorized.');
        }

        return self::success(
            'Enrollment retrieved successfully.',
            (new EnrollmentResource($enrollment))->resolve(),
        );
    }
}
